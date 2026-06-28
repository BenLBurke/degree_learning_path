#!/usr/bin/env python3
"""
FakeRNN Demo
============
A Markov-chain language model pretending to be an RNN.
Trained on: Sherlock Holmes | J.R.R. Tolkien | SpongeBob SquarePants

Usage:
    python main.py                     # run the full demo
    python main.py --source sherlock   # single-source model
    python main.py --source tolkien
    python main.py --source spongebob
    python main.py --source all        # blend all three (default)
    python main.py --seed "the dark"   # custom seed phrase
    python main.py --order 3           # trigram model (more coherent)
    python main.py --temp 0.5          # lower temp = more conservative
    python main.py --temp 1.8          # higher temp = chaotic energy
"""

import argparse
import random
from model import FakeRNN
from corpus import ALL_CORPUS, COMBINED_TEXT


BANNER = """
╔══════════════════════════════════════════════════════════════╗
║          F A K E   R N N   —   Word Prediction Demo          ║
║   Sherlock Holmes  ×  J.R.R. Tolkien  ×  SpongeBob          ║
╚══════════════════════════════════════════════════════════════╝
"""

SOURCE_SEEDS = {
    "sherlock": ["elementary", "the game", "watson i", "london was", "holmes sat"],
    "tolkien":  ["not all", "in a hole", "the wanderer", "beyond the", "one path"],
    "spongebob": ["i am ready", "the krusty", "patrick star", "mr krabs", "squidward"],
    "all":       ["the road", "it was", "in the", "and then", "but the"],
}


def print_section(title: str):
    print(f"\n{'─' * 64}")
    print(f"  {title}")
    print('─' * 64)


def run_demo(source: str, seed: str | None, order: int, temperature: float):
    print(BANNER)

    # ── Select corpus ────────────────────────────────────────────────
    if source == "all":
        text = COMBINED_TEXT
        label = "Sherlock + Tolkien + SpongeBob (blended)"
    else:
        text = ALL_CORPUS[source]
        label = {"sherlock": "Sherlock Holmes", "tolkien": "J.R.R. Tolkien",
                 "spongebob": "SpongeBob SquarePants"}[source]

    print(f"  Source   : {label}")
    print(f"  Order    : {order}-gram  (marketed as '{order}-layer RNN')")
    print(f"  Temp     : {temperature}")

    # ── "Train" ──────────────────────────────────────────────────────
    print_section("Training Phase  (backprop through time™)")
    rnn = FakeRNN(order=order, temperature=temperature)
    rnn.fit(text, epochs=5, verbose=True)

    # ── Loss curve ───────────────────────────────────────────────────
    print_section("Loss Curve  (definitely real gradients)")
    losses = rnn.loss_curve()
    max_loss = max(losses)
    for i, loss in enumerate(losses, 1):
        bar_len = int(30 * loss / max_loss)
        bar = "▓" * bar_len
        print(f"  Epoch {i}  {bar:<30}  {loss:.4f}")

    # ── Top predictions for a sample context ─────────────────────────
    print_section("Top-5 Next-Word Predictions  (softmax output layer)")
    sample_seeds = SOURCE_SEEDS.get(source, SOURCE_SEEDS["all"])
    sample_seed = random.choice(sample_seeds)
    context = sample_seed.split()
    preds = rnn.top_predictions(context, n=5)
    print(f"  Context : {' '.join(repr(w) for w in context)}")
    print(f"  Hidden  : {rnn.hidden_state_repr()}")
    print()
    if preds:
        for word, prob in preds:
            bar = "█" * int(prob * 40)
            print(f"  {word:<18} {bar:<40} {prob:.3f}")
    else:
        print("  (no transitions found for this context)")

    # ── Generate text ────────────────────────────────────────────────
    print_section("Generated Text  (autoregressive forward pass)")

    chosen_seed = seed or random.choice(sample_seeds)
    print(f"  Seed    : \"{chosen_seed}\"")
    print()
    output = rnn.generate(seed=chosen_seed, max_words=80)
    # word-wrap at 64 chars
    words = output.split()
    line, lines = [], []
    for w in words:
        if len(" ".join(line + [w])) > 64:
            lines.append("  " + " ".join(line))
            line = [w]
        else:
            line.append(w)
    if line:
        lines.append("  " + " ".join(line))
    print("\n".join(lines))

    # ── Cross-source chaos ───────────────────────────────────────────
    if source == "all":
        print_section("Cross-Universe Mashup  (the real reason we're here)")
        mashup_seeds = [
            "holmes sat moodily",
            "not all those who wander",
            "i am ready patrick",
            "the dark lord counted",
            "elementary my dear squidward",
        ]
        for ms in mashup_seeds[:3]:
            out = rnn.generate(seed=ms, max_words=30)
            print(f"  \"{ms}\"")
            print(f"    → {out}")
            print()

    print('─' * 64)
    print("  Done. The fake RNN has spoken.")
    print('─' * 64)
    print()


def main():
    parser = argparse.ArgumentParser(description="FakeRNN next-word predictor")
    parser.add_argument("--source", choices=["sherlock", "tolkien", "spongebob", "all"],
                        default="all", help="Which corpus to train on")
    parser.add_argument("--seed", type=str, default=None,
                        help="Seed phrase for text generation")
    parser.add_argument("--order", type=int, default=2,
                        help="N-gram order (1-4 recommended)")
    parser.add_argument("--temp", type=float, default=1.0,
                        help="Sampling temperature (0.5=focused, 2.0=chaotic)")
    args = parser.parse_args()

    run_demo(
        source=args.source,
        seed=args.seed,
        order=args.order,
        temperature=args.temp,
    )


if __name__ == "__main__":
    main()
