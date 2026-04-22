"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits, getAddress, parseUnits } from "viem";
import { sdk } from "@farcaster/miniapp-sdk";

/* ─── Constants ────────────────────────────────────────── */

/** USDC on Base mainnet */
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

/** Recipient ENS name (for display) */
const ENS_NAME = "duodomusica.eth";

/** Recipient wallet address (direct, no ENS resolution needed) */
const RECIPIENT_ADDRESS = "0x0d3c16F2D152373539610dA87D231f4d78F73a35" as const;

/** Minimum contribution in USDC */
const MIN_AMOUNT = 1;

/** Cast text for sharing after successful contribution */
const SHARE_CAST_TEXT = [
  "I become an EP of @duodomusica at /farcon-rome \ud83c\uddee\ud83c\uddf9",
  "\ud83d\udc47",
  "https://farcaster.xyz/miniapps/qdooGiOr3FGt/do-d-at-farcon-rome",
].join("\n");

/** USDC decimals */
const USDC_DECIMALS = 6;

/** Minimal ERC-20 ABI for transfer + balanceOf */
const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/* ─── Component ───────────────────────────────────────── */

type Step = "idle" | "connecting" | "switching" | "confirming" | "pending" | "success" | "error";

export function ContributeButton() {
  const [step, setStep] = useState<Step>("idle");
  const [inputValue, setInputValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);

  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { writeContract, data: txHash } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // ── Recipient address (direct, no ENS resolution) ────
  const recipient = getAddress(RECIPIENT_ADDRESS);

  // ── USDC balance on Base ─────────────────────────────
  const { data: rawBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const usdcBalance = rawBalance !== undefined
    ? parseFloat(formatUnits(rawBalance as bigint, USDC_DECIMALS))
    : null;

  // Refetch balance when wallet connects or chain changes
  useEffect(() => {
    if (address) refetchBalance();
  }, [address, chain?.id, refetchBalance]);

  // ── Derived state ────────────────────────────────────
  const parsedAmount = parseFloat(inputValue);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= MIN_AMOUNT;
  const hasInsufficientBalance = isValidAmount && usdcBalance !== null && parsedAmount > usdcBalance;

  // Update step when tx confirms
  if (txConfirmed && step === "pending") {
    setStep("success");
  }

  // ── Handlers ─────────────────────────────────────────

  async function handleContribute() {
    setErrorMsg("");

    if (!isValidAmount) return;

    if (!recipient) {
      setErrorMsg("Could not resolve recipient ENS name. Please try again.");
      setStep("error");
      return;
    }

    if (hasInsufficientBalance) {
      setErrorMsg("Insufficient USDC balance on Base");
      setStep("error");
      return;
    }

    try {
      if (!isConnected) {
        // Check if we're inside Farcaster (first connector is farcasterMiniApp)
        const farcasterConnector = connectors.find(c => c.id === "farcasterMiniApp");
        const isInFarcaster = typeof window !== "undefined" && (
          window.parent !== window || 
          navigator.userAgent.toLowerCase().includes("warpcast") ||
          navigator.userAgent.toLowerCase().includes("farcaster")
        );
        
        if (isInFarcaster && farcasterConnector) {
          // Inside Farcaster - use farcaster connector directly
          setStep("connecting");
          connect(
            { connector: farcasterConnector },
            {
              onSuccess: () => proceedAfterConnect(),
              onError: (err) => {
                setErrorMsg(err.message || "Failed to connect wallet");
                setStep("error");
              },
            }
          );
        } else {
          // Outside Farcaster - show wallet selection modal
          setShowWalletModal(true);
        }
        return;
      }

      proceedAfterConnect();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  }

  function proceedAfterConnect() {
    if (chain?.id !== base.id) {
      setStep("switching");
      switchChain(
        { chainId: base.id },
        {
          onSuccess: () => sendTransaction(),
          onError: (err) => {
            setErrorMsg(err.message || "Failed to switch to Base");
            setStep("error");
          },
        }
      );
      return;
    }
    sendTransaction();
  }

  function sendTransaction() {
    if (!recipient) return;

    setStep("confirming");
    const amountInWei = parseUnits(parsedAmount.toString(), USDC_DECIMALS);

    writeContract(
      {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient, amountInWei],
        chain: base,
      },
      {
        onSuccess: () => setStep("pending"),
        onError: (err) => {
          if (err.message?.includes("User rejected") || err.message?.includes("denied")) {
            setStep("idle");
          } else {
            setErrorMsg(err.message || "Transaction failed");
            setStep("error");
          }
        },
      }
    );
  }

  // ── Success state ────────────────────────────────────
  if (step === "success") {
    return (
      <section className="space-y-3">
        <div className="w-full flex flex-col items-center gap-3 px-5 py-5 bg-primary/10 border border-primary/20 rounded-lg">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-sans font-semibold text-foreground text-center">
            {"You are now an Executive Producer \ud83c\udfdb\ufe0f\u2728"}
          </p>
          <p className="text-xs text-muted-foreground font-sans text-center leading-relaxed">
            {"Your $"}{parsedAmount}{" USDC was sent to "}{ENS_NAME}{". We\u2019ll be in touch with your NFT and credits."}
          </p>
          {txHash && (
            <button
              onClick={() => {
                const url = `https://basescan.org/tx/${txHash}`;
                try {
                  sdk.actions.openUrl(url);
                } catch {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              }}
              className="text-xs text-primary font-sans underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              View on Basescan
            </button>
          )}
          <button
  onClick={async () => {
    try {
      await sdk.actions.composeCast({
        text: SHARE_CAST_TEXT,
        embeds: [
          "https://farcaster.xyz/miniapps/qdooGiOr3FGt/do-d-at-farcon-rome"
        ]
      });
    } catch {
      const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(SHARE_CAST_TEXT)}`;
      window.open(composeUrl, "_blank", "noopener,noreferrer");
    }
  }}
  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-1 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
>
  Share
</button>
        </div>
      </section>
    );
  }

  // ── Button label ─────────────────────────────────────
  function getButtonLabel(): string {
    if (!isConnected) return "Connect Wallet";
    switch (step) {
      case "connecting": return "Connecting wallet\u2026";
      case "switching": return "Switching to Base\u2026";
      case "confirming": return "Confirm in wallet\u2026";
      case "pending": return "Waiting for confirmation\u2026";
      case "error": return "Try again";
      default:
        if (hasInsufficientBalance) return "Insufficient balance";
        return isValidAmount ? `Send $${parsedAmount} USDC` : "Enter amount";
    }
  }

  const isLoading = step === "connecting" || step === "switching" || step === "confirming" || step === "pending";
  const isDisabled = isLoading || (isConnected && !isValidAmount) || hasInsufficientBalance;

  return (
    <section className="space-y-3">
      {/* Amount input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-sans text-sm">
          {"$"}
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={MIN_AMOUNT}
          step="1"
          placeholder="Enter USDC amount"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (step === "error") setStep("idle");
          }}
          disabled={isLoading}
          className="w-full pl-8 pr-16 py-3 bg-secondary/40 border border-border rounded-lg font-sans text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-sans text-xs">
          USDC
        </span>
      </div>

      {/* Balance + validation info */}
      <div className="flex items-center justify-between px-1">
        {isConnected && usdcBalance !== null ? (
          <p className="text-[10px] text-muted-foreground/60 font-sans">
            {"Balance: "}{usdcBalance.toFixed(2)}{" USDC"}
          </p>
        ) : (
          <span />
        )}
        {inputValue !== "" && !isValidAmount && (
          <p className="text-[10px] text-muted-foreground/60 font-sans">
            {"Min: $"}{MIN_AMOUNT}
          </p>
        )}
        {hasInsufficientBalance && (
          <p className="text-[10px] text-red-400 font-sans">
            Insufficient USDC balance on Base
          </p>
        )}
      </div>

      {/* Recipient info */}
      <p className="text-center text-[10px] text-muted-foreground/50 font-sans">
        {"Sending to "}{ENS_NAME}
      </p>

      {/* Main CTA */}
      <button
        onClick={step === "error" ? () => { setStep("idle"); handleContribute(); } : handleContribute}
        disabled={isDisabled}
        className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary text-primary-foreground rounded-lg font-sans text-base font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {getButtonLabel()}
      </button>

      {/* Error message */}
      {step === "error" && errorMsg && (
        <p className="text-xs text-red-400 font-sans text-center">{errorMsg}</p>
      )}

      {/* Connected address indicator */}
      {isConnected && address && step === "idle" && (
        <p className="text-center text-[10px] text-muted-foreground/50 font-sans font-mono truncate">
          {address.slice(0, 6)}{"..."}{address.slice(-4)}
        </p>
      )}

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-background border border-border rounded-xl p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold font-sans text-foreground">Connect Wallet</h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {connectors
                .filter(c => c.id !== "farcasterMiniApp")
                .map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => {
                      setShowWalletModal(false);
                      setStep("connecting");
                      connect(
                        { connector },
                        {
                          onSuccess: () => setStep("idle"),
                          onError: (err) => {
                            setErrorMsg(err.message || "Failed to connect wallet");
                            setStep("error");
                          },
                        }
                      );
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <span className="text-sm font-medium font-sans text-foreground">
                      {connector.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
