"""
Training corpus: Sherlock Holmes, Tolkien-flavored fantasy, and SpongeBob.
All text is either public domain or original parody content.
"""

SHERLOCK_TEXT = """
It was in the latter days of September and the equinoctial gales had set in with
exceptional violence. All day the wind had screamed and the rain had beaten against
the windows so that even here in the heart of great London we were forced to raise
our minds for the instant from the routine of life and to recognise the presence of
those great elemental forces which shriek at mankind through the bars of his
civilisation like untamed beasts in a cage. As evening drew in the storm grew louder
and louder and the wind cried and sobbed like a child in the chimney.

Holmes sat moodily at one side of the fireplace cross-indexing his records of crime
while I at the other was deep in one of Clark Russell's fine sea stories until the
howl of the gale from without seemed to blend with the text and the splash of the
rain to lengthen out into the long swash of the sea waves. My wife was on a visit
to her mother's and for a few days I was a dweller once more in my old quarters
at Baker Street.

"I have been thinking Watson" said Holmes presently "about this peculiar business
of the Abernetty family and the singular way in which the parsley had sunk into
the butter upon a hot day. But I digress. The question before us is far more
pressing. You see the criminal mind is often betrayed not by what it does but
by what it conspicuously avoids doing. Elementary but frequently overlooked."

I laid down my book and looked across at my friend. "You astonish me Holmes.
I had not considered it from that angle."

"That is precisely why I am Holmes and you are Watson my dear fellow" he replied
with a thin smile settling deeper into his chair. "The game is afoot and we must
not let the scent grow cold. Bring your revolver Watson and we shall see what
London has to offer us tonight in the way of adventure and villainy."

The baker street irregulars had reported a sighting near the docks. Holmes
leaped to his feet with the energy that so often belied his apparent languor
and in moments we were in a hansom cab rattling through the wet streets of
London toward whatever dark mystery awaited us. I checked my revolver.

"You observed the mud on his left boot?" Holmes asked without looking at me.
"Of course" I said. "No you did not Watson" he replied cheerfully "but that
is why you are indispensable to me. A man who admits ignorance is infinitely
preferable to one who pretends knowledge he does not possess."
""".strip()

TOLKIEN_TEXT = """
In a hole in the ground there lived a curious wanderer who had walked the long roads
between the mountains and the sea. The old king had said that the roads of this world
go ever ever on and the wanderer had found this to be more true than comfortable.

Beyond the misty mountains cold where the shadows lie and the ancient trees remember
names long forgotten by the race of men there dwelt the elder folk who counted years
as leaves and watched the seasons turn without sorrow or great haste. Their halls
were lit with silver lanterns and the air smelled always of pine and cold stone and
something older that had no name in any tongue of men.

The wanderer came at last to the crossroads where three paths met beneath an ancient
stone on which were carved runes in a script so old that even the elves could not
fully read them. One path led east toward the shadow and fire. One led west toward
the grey havens and the sea beyond all maps. The third led south through the fields
of men into the wide world of commerce and mortality.

"Not all those who wander are lost" the wanderer said to himself "but I confess
to some uncertainty regarding my present whereabouts." He opened his map which
had been given to him by a wizard with an irritating habit of speaking in riddles
and found it to be entirely blank except for the words This is a map written
upon it in a very confident hand.

The ring of power had been lost for an age of the world and the dark lord searched
still through all his servants and all his watching eyes but could not find it for
it had fallen into very ordinary hands in a very ordinary place and this was
precisely what the dark lord in all his malevolence had never once considered to
look for. Evil has a weakness for grandeur that often proves its undoing.

Through Mirkwood they had traveled and through the realm of the wood elves and
across the long lake and up to the lonely mountain where the dragon had slept
upon his hoard of gold for centuries dreaming golden dreams of more gold and
the ruin of dwarves. The mountain stood against the sky like a warning.

"Courage" said the wizard "is not the absence of fear but the judgment that
something else is more important. Now then. The front door if you please."
""".strip()

SPONGEBOB_TEXT = """
The Krusty Krab was the finest restaurant in all of Bikini Bottom and SpongeBob
SquarePants was its finest fry cook and he knew it and he was very happy about it.
He woke up every morning at the crack of dawn and fed Gary his snail and made
sure his spatula was polished to a mirror shine and ran out the door with his
pants very square and his tie very clip-on.

"I am ready" he announced to no one in particular and then he said it again because
it bore repeating. "I AM READY." Patrick Star who lived under a rock next door
opened his rock and looked out with the expression of someone who had just been
awoken from a very satisfying nap and did not mind because the waking world was
also pretty good.

"Where are you going SpongeBob?" Patrick asked. "To make Krabby Patties Patrick"
SpongeBob replied "the most perfect food in all the seven seas." Patrick considered
this for a moment with the full weight of his considerable leisure. "Can I have one?"
he asked. "Patrick you always ask that." "I know" said Patrick "it has a good
success rate."

Squidward Tentacles lived between them in a house shaped like his own head which
he had not intended as a statement but which people kept treating as one. He played
clarinet poorly but with great conviction and he painted self-portraits that he
described as deeply misunderstood by a public not yet ready for his vision.

At the Krusty Krab Mr Krabs counted his money with great satisfaction and thought
about how to make slightly more money while spending slightly less. SpongeBob
flipped patties with a song in his heart and a spatula in his hand and Squidward
took orders with the air of someone who had expected more from life and had decided
to be extremely clear about this expectation to anyone who would listen.

"The secret formula" Mr Krabs whispered to no one "is the foundation of me empire."
Plankton meanwhile was tunneling up through the floor again with a new plan that
was only slightly different from all the previous plans and he had very high hopes
about this one specifically.

"SpongeBob" said Sandy Cheeks the Texas squirrel in her air dome "I have been
running some calculations and I believe that with sufficient practice and
determination a fry cook of your caliber could flip a patty all the way to the
surface." SpongeBob gasped with sincere joy. "That is my dream Sandy. That is
literally my dream."
""".strip()

ALL_CORPUS = {
    "sherlock": SHERLOCK_TEXT,
    "tolkien": TOLKIEN_TEXT,
    "spongebob": SPONGEBOB_TEXT,
}

COMBINED_TEXT = "\n\n".join(ALL_CORPUS.values())
