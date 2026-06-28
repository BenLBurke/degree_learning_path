"""
FakeRNN: A Markov-chain language model wearing an RNN costume.

Internally it's an n-gram transition table. Externally it talks about
hidden states, loss curves, and gradient descent like a proper neural net.
"""

import random
import math
import re
from collections import defaultdict, Counter


class FakeRNN:
    """
    Recurrent Neural Network* for next-word prediction.

    * (it's a Markov chain but the vibes are immaculate)
    """

    def __init__(self, order: int = 2, temperature: float = 1.0):
        self.order = order          # "number of hidden layers" (context window)
        self.temperature = temperature
        self.transitions: dict[tuple, Counter] = defaultdict(Counter)
        self.vocab: set[str] = set()
        self._trained = False
        self._fake_loss: list[float] = []
        self._hidden_state: tuple = ()   # very important neural state

    # ------------------------------------------------------------------
    # "Training"
    # ------------------------------------------------------------------

    def fit(self, text: str, epochs: int = 3, verbose: bool = True) -> "FakeRNN":
        """
        Train the RNN using backpropagation through time*.

        * (we iterate over the tokens a few times and build a frequency table)
        """
        tokens = self._tokenize(text)
        self.vocab.update(tokens)

        if verbose:
            print(f"  Vocabulary size : {len(self.vocab):,} tokens")
            print(f"  Corpus length   : {len(tokens):,} tokens")
            print(f"  Context window  : {self.order} (hidden units)")
            print()

        base_loss = 4.2
        for epoch in range(1, epochs + 1):
            # "Gradient descent" pass
            for i in range(len(tokens) - self.order):
                context = tuple(tokens[i : i + self.order])
                next_word = tokens[i + self.order]
                self.transitions[context][next_word] += 1

            # Fake but realistic-looking loss curve
            noise = random.gauss(0, 0.04)
            loss = base_loss * math.exp(-0.35 * epoch) + abs(noise)
            self._fake_loss.append(loss)

            if verbose:
                bar = "█" * int(20 * epoch / epochs) + "░" * (20 - int(20 * epoch / epochs))
                print(f"  Epoch {epoch}/{epochs}  [{bar}]  loss: {loss:.4f}")

        self._trained = True
        self._hidden_state = tuple(tokens[-self.order :])
        if verbose:
            print(f"\n  Training complete. Final loss: {self._fake_loss[-1]:.4f}")
        return self

    # ------------------------------------------------------------------
    # "Inference"
    # ------------------------------------------------------------------

    def predict_next(self, context_words: list[str]) -> str:
        """Sample the next word given a context (forward pass)."""
        self._check_trained()
        context = tuple(context_words[-self.order :])
        # back off if unseen n-gram
        while context not in self.transitions and len(context) > 1:
            context = context[1:]
        if context not in self.transitions:
            return random.choice(list(self.vocab))

        counts = self.transitions[context]
        # temperature sampling (the only real ML thing here)
        words, freqs = zip(*counts.items())
        scaled = [f ** (1.0 / self.temperature) for f in freqs]
        total = sum(scaled)
        probs = [s / total for s in scaled]
        return random.choices(words, weights=probs, k=1)[0]

    def generate(self, seed: str | None = None, max_words: int = 60) -> str:
        """
        Run the forward pass to generate a sequence of words.

        The hidden state is updated at each time step, just like a real RNN
        except completely different in every technical respect.
        """
        self._check_trained()

        if seed:
            tokens = self._tokenize(seed)
        else:
            # pick a random starting context from the training data
            tokens = list(random.choice(list(self.transitions.keys())))

        self._hidden_state = tuple(tokens[-self.order :])

        for _ in range(max_words):
            next_word = self.predict_next(list(self._hidden_state))
            tokens.append(next_word)
            self._hidden_state = tuple(tokens[-self.order :])
            if next_word in {".", "!", "?"} and len(tokens) > 10:
                break

        return self._detokenize(tokens)

    # ------------------------------------------------------------------
    # Diagnostics
    # ------------------------------------------------------------------

    def loss_curve(self) -> list[float]:
        """Return the training loss per epoch."""
        return list(self._fake_loss)

    def top_predictions(self, context_words: list[str], n: int = 5) -> list[tuple[str, float]]:
        """Return the top-n next-word predictions with probabilities."""
        self._check_trained()
        context = tuple(context_words[-self.order :])
        while context not in self.transitions and len(context) > 1:
            context = context[1:]
        if context not in self.transitions:
            return []
        counts = self.transitions[context]
        total = sum(counts.values())
        return sorted(
            [(w, c / total) for w, c in counts.items()],
            key=lambda x: -x[1],
        )[:n]

    def hidden_state_repr(self) -> str:
        """Return a human-readable representation of the current hidden state."""
        return f"h_t = [{', '.join(repr(w) for w in self._hidden_state)}]"

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        # split on whitespace but keep punctuation as separate tokens
        text = re.sub(r"([.!?,;:\"'])", r" \1 ", text)
        return [t for t in text.lower().split() if t]

    @staticmethod
    def _detokenize(tokens: list[str]) -> str:
        text = " ".join(tokens)
        # re-attach punctuation
        text = re.sub(r" ([.!?,;:\"'])", r"\1", text)
        return text.capitalize()

    def _check_trained(self):
        if not self._trained:
            raise RuntimeError("Call .fit() before generating text.")
