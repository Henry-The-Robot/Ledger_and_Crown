// Ledger & Crown — village scenes. Short, optional, one-time conversations that surface while you run the farm (days 9 to 28): a backstory told over a counter,
// a favour that is really a credit decision, a clue about who is buying up the valley's debts. Each belongs to one person; when a scene is waiting, that person
// shows a red "!" and walking up to them plays it. Choices matter a little now (trust, a flag, a real change to an invoice) and a lot later (the Steward's offer,
// the ending). They also carry lessons: the Hobb scene IS a credit decision; the Vane scene IS a callable-debt covenant. Nothing here is required to finish the
// season, and nothing here breaks the books: every money effect goes through Spring.post.
// Each scene is DATA (a record of steps); core/scene.js plays it. The record format is in core/scene.js and chapters/README.md.
window.Scenes = (function () {
  const K = window.SceneKit || require("../../../core/scene.js");
  const RECORDS = [
    { id: "maud_abacus", who: "maud", from: 9, hint: "Maud has something to say that isn't about the books.", steps: [
      { say: "maud", lines: ["Sit. You've been running from lesson to lesson like a hen after corn. Let me ask you something unrelated.", "Your uncle and I had a game. He'd name a number. I'd tell him whether it was a profit or a fact."] },
      { ask: "maud", text: "Which would you like to hear?", options: [
        { label: "Which is the abacus?", then: [{ say: "maud", lines: ["The abacus is a fact. Beads don't have opinions.", "A Ledger is mostly opinion: depreciation, allowances, 'estimated' this and 'probable' that. Useful opinions. But opinions."] }] },
        { label: "What number did he name?", then: [{ say: "maud", lines: ["Always the same number: what he'd earned this year. And I'd say, 'And how much can you spend on Friday?'", "He never had a number for that one."] }] }] },
      { say: "maud", lines: ["Remember the difference. There will be an examination at the end of spring. You won't need to remember it. You'll feel it."] },
      { trust: ["maud", 1] }] },
    { id: "ashby_bram", who: "ashby", from: 11, hint: "Ashby wants a word before the wedding order.", steps: [
      { say: "ashby", lines: ["Sit a minute, dear. The wedding order is a lot. Let me tell you why I ask for money first.", "Bram baked for forty families. 'Pay you Friday, Bram.' Every Friday there was another Friday.", "When he died, the Ledger said we'd earned two hundred. The cupboard had four loaves and a dog. That's the thing about being owed, dear. It feels like having."] },
      { ask: "ashby", text: "I'll tell you one more thing if you tell me one.", options: [
        { label: "I'll always deliver on time.", then: [{ say: "ashby", lines: ["That's a promise that costs sleep, dear. Make it anyway."] }, { flag: ["ashbyPromise", "deliver"] }] },
        { label: "I'll never ask you for credit.", then: [{ say: "ashby", lines: ["Good manners, and sensible. Cash is a kindness between friends."] }, { flag: ["ashbyPromise", "cash"] }] },
        { label: "Forty families? Who paid in the end?", then: [{ say: "ashby", lines: ["Eleven. The rest are still 'meaning to'. I keep their names in the flour bin. For luck."] }, { flag: ["ashbyPromise", "ledger"] }] }] },
      { flag: ["ashbyAsked", true] }, { trust: ["ashby", 1] }] },
    { id: "crane_offduty", who: "crane", from: 13, to: 17, at: [32, 10], card: ["A scratched second seal", "under the Crown's seal"], hint: "Crane is standing by the well without his ledger.", steps: [
      { say: "crane", lines: ["Heir. I am off duty, and my ledger is at home. I feel exposed.", "I am not here to collect. I am here to say something I am not employed to say.", "Item: the writ you carry. I have read it eleven times, and it is longer than it should be. A debt of this kind does not usually come with a second seal."] },
      { ask: "crane", text: "He waits, pen-less, which seems to hurt him.", options: [
        { label: "A second seal?", then: [{ say: "crane", lines: ["Small, under the Crown's, and scratched as if someone wished it were not there.", "I cannot read it. There is a word for what I am not, and I do not have it. I dislike that."] }] },
        { label: "Why tell me?", then: [{ say: "crane", lines: ["I was a clerk in the Duke's counting-house once. Two columns did not agree, and no one asked about it, until you.", "Do not make me regret my sentences."] }] }] },
      { say: "crane", lines: ["Keep your sacks counted, heir. I shall go back to being unpleasant."] },
      { flag: ["craneSeal", true] }, { clue: 1 }, { trust: ["crane", 2] }] },
    { id: "tomas_contracts", who: "tomas", from: 13, card: ["A grey cloak buys seed contracts", "offered triple"], hint: "Tomas is whispering. Tomas never whispers.", steps: [
      { say: "tomas", lines: ["My friend! Lean in. No further. Closer. I have something free and it isn't a sample.", "A man in a grey cloak came by. Very polite. Gloves on a warm day. Wanted every seed contract in the valley. Offered triple.", "I said 'not today'. 'Never' is an expensive word. And triple is what a man pays when he means to own the thing after you."] },
      { ask: "tomas", text: "He looks genuinely unsettled, which on Tomas is a new colour.", options: [
        { label: "What did he want with seed?", then: [{ say: "tomas", lines: ["Not seed, my friend. Leverage. If one man holds everyone's credit, he can call it in all at once and watch the valley fold like a bad hand.", "Concentration, the clever ones call it. The valley calls it Tuesday."] }] },
        { label: "Whose contracts?", then: [{ say: "tomas", lines: ["Yours. Ashby's. Hobb's. Pell's. Edric's too, I still hold his: he owed me thirty. Don't look at me like that, I forgave it. It's in a drawer marked 'forgiven, do not mention'."] }] }] },
      { flag: ["vaneBuying", true] }, { clue: 1 }, { trust: ["tomas", 1] }] },
    { id: "hobb_extension", who: "hobb", from: 14, need: { invoiceOpen: "hobb" }, bind: { invoice: "hobb" }, hint: "Hobb has a favour to ask. It's costing him.", steps: [
      { say: "hobb", lines: ["I... have a thing to ask. I'd rather be hit with the wheel.", "The road washed out. Three weeks of flour stuck on the wrong side of a river. My customers can't pay me. So I can't pay you.", "I'm asking for seven more days on the {amt} I owe you. I'll pay... eventually. I always have."] },
      { ask: "hobb", text: "He has taken his hat off, which he does for funerals.", options: [
        { label: "Of course. Seven more days.", then: [{ op: "delay", who: "hobb", days: 7 }, { flag: ["hobbExt", "gave"] }, { trust: ["hobb", 2] }, { say: "hobb", lines: ["...Thank you. You'll... not regret it. Probably."] }, { maud: "You just lent Hobb money: not coin, but time. A receivable is a loan you didn't price, so what did you charge him for the week?" }] },
        { label: "I can't afford to wait. The day it's due.", then: [{ flag: ["hobbExt", "refused"] }, { trust: ["hobb", -1] }, { say: "hobb", lines: ["...Fair. A man pays what he owes. I'll find it."] }] },
        { label: "Half now, half in a week ({half} today).", then: [{ op: "halfNow", who: "hobb", days: 7, note: "Hobb paid half of his invoice early, asked for time on the rest" }, { flag: ["hobbExt", "half"] }, { trust: ["hobb", 1] }, { say: "hobb", lines: ["Half... today. Half in a week. That's... better than I asked for. You're your uncle's heir and also not."] }] }] }] },
    { id: "ezra_letter", who: "ezra", from: 18, hint: "Ezra has something in his drawer for you.", steps: [
      { say: "ezra", lines: ["Sit. I've been waiting for a day you could read a balance sheet without flinching. Today is close enough.", "Edric left this in my keeping. He asked me to give it to you when you understood what a rate is."] },
      { ask: "ezra", text: "He sets the letter on the desk between you, squared to the edge.", options: [
        { label: "Read it.", then: [] },
        { label: "Why didn't he give it to Maud?", then: [{ say: "ezra", lines: ["Because Maud would have argued with it. It is easier to argue with a friend than a letter."] }] }] },
      { letter: 7 },
      { say: "ezra", lines: ["He's right that I never lied to him. It was the only kindness I knew how to do him.", "If you want the rest, bring me a forecast I can believe."] },
      { trust: ["ezra", 2] }] },
    { id: "mira_rumour", who: "mira", from: 17, card: ["Someone buys the valley's notes", "forty cents a coin"], hint: "Mira is dying to tell someone something.", steps: [
      { say: "mira", lines: ["Between us and the cabbages: do you know who's buying paper?", "Grey cloak. Gloves. Every village from here to the river. Not grain, not seed: notes. Mortgages. A bakery guarantee, a mill loan, a sixty-coin promise from some widow's late husband."] },
      { ask: "mira", text: "She is whispering at the top of her voice.", options: [
        { label: "Who sold him the paper?", then: [{ say: "mira", lines: ["The Crown. Glad to be rid of it. Forty cents on the coin, I heard. A debt you can't collect is worth forty cents. A debt you can call in all at once is worth a farm."] }] },
        { label: "Why would he want it?", then: [{ say: "mira", lines: ["Because a man who holds all the notes can call them all in, at once, on a day of his choosing. Midwinter, say. Everyone's in the same boat then, and he owns the boat."] }] }] },
      { flag: ["vaneBuying", true] }, { clue: 1 }, { trust: ["mira", 1] }] },
    { id: "maud_confession", who: "maud", from: 19, hint: "Maud has been putting something off.", steps: [
      { say: "maud", lines: ["Sit. I've been putting this off for a week, and I put things off about as well as I count them.", "The winter before Edric died, I was at the assizes. Six weeks. Reeve's business. When I came back, he'd signed something. He wouldn't say what.", "I asked. He said, 'Don't worry, Maud. It's only my name.' A man says that about a thing that isn't only his name."] },
      { ask: "maud", text: "She is looking at the abacus, which she has not touched.", options: [
        { label: "It wasn't your fault.", then: [{ say: "maud", lines: ["Kind. Not a fact. Facts are my department."] }] },
        { label: "What do you think he signed?", then: [{ say: "maud", lines: ["A guarantee. I think. He had a weakness for standing behind people. I don't know whose."] }] },
        { label: "Then we find out.", then: [{ say: "maud", lines: ["Mm. Now you sound like him. Let's hope it ends better."] }] }] },
      { flag: ["maudConfessed", true] }, { trust: ["maud", 2] }] },
    { id: "ashby_guarantee", who: "ashby", from: 21, card: ["Edric stood surety for Ashby", "“It's only my name.”"], hint: "Ashby has gone quiet over the dough.", steps: [
      { say: "ashby", lines: ["Put the sack down, dear. I've been wondering how to say this since the day you walked in.", "When Bram died, the bakery was in debt. A sum I couldn't have paid in ten years. The Crown's collector came, polite as a hearse. Your uncle was in the shop that day.", "He didn't say a word. He walked to the collector's table and signed. 'Surety,' he called it. 'It's only my name, Ashby. It costs nothing.'", "It cost him everything, didn't it? I didn't know until the bailiff came for your farm. I've put an extra loaf in every order since, to try to balance it. You never noticed the loaves."] },
      { ask: "ashby", text: "Her ring is off its ribbon and in her fist.", options: [
        { label: "It was his choice.", then: [{ say: "ashby", lines: ["Kind, dear. Wrong. But kind."] }] },
        { label: "How much was it?", then: [{ say: "ashby", lines: ["Most of what the Crown says you owe. I never knew the sum. He never told me. That was the worst of him: he never told anyone."] }] },
        { label: "I'll find a way to pay it.", then: [{ say: "ashby", lines: ["Don't you dare. If you carry that I'll have to carry you. Bake with me, dear. That's all I want."] }] }] },
      { letter: 6 }, { flag: ["guarantee", true] }, { clue: 1 }, { trust: ["ashby", 3] }] },
    { id: "crane_seal", who: "crane", from: 23, at: [32, 10], card: ["Vane's mark on the seal", "Crown sold your debt"], need: { flag: "craneSeal" }, hint: "Crane is by the well again. He has a paper.", steps: [
      { say: "crane", lines: ["Item: a copy of the writ. It is a copy I should not have made, and I made it.", "The second seal. A man in the counting-house once taught me to read the small ones. It is a note-buyer's mark, and it means the Crown sold your debt, heir, to someone."] },
      { ask: "crane", text: "He holds the paper at arm's length, as if it might go off.", options: [
        { label: "To whom?", then: [{ say: "crane", lines: ["The mark is Corvin Vane's. It is a small mark; Vane has never been a man for large ones."] }] },
        { label: "Can they do that?", then: [{ say: "crane", lines: ["They can. A debt is a thing, like a sack, to be bought, sold and called in. Item: the part I find unpleasant is the discount."] }] }] },
      { flag: ["craneVane", true] }, { clue: 1 }, { trust: ["crane", 2] }] },
    { id: "vane_offer", who: "duke", from: 24, at: [36, 10], card: ["Vane's “partnership”", "a mortgage payable on demand"], hint: "The Steward is in the square. He has brought a pen.", steps: [
      { say: "duke", lines: ["Heir. I'm told you've done the impossible: you've made a profit and kept the Cash. I'm delighted. Truly.", "I come with an offer. Nothing grand. I hold your note now, the Crown found it tedious. I should like to forgive it.", "All of it. The writ. Gone. In exchange for the millstream rights at the east boundary and a modest mortgage over the farm. A formality. We'd be partners."] },
      { ask: "duke", text: "He has uncapped the pen. He is a very patient man.", options: [
        { label: "No.", then: [{ say: "duke", lines: ["No. How decisive. Edric said no to me once. Very kindly. It ended much the same.", "The offer stands until Midwinter. Offers do. It is people who expire."] }, { flag: ["vane", "refused"] }] },
        { label: "Tell me more.", then: [{ say: "duke", lines: ["The mortgage would be over the whole farm, you understand. Payable on demand.", "Demand being, of course, mine. A technicality. Partners trust one another."] }, { flag: ["vane", "asked"] }, { maud: "'Payable on demand.' Read that twice: a loan he can call in whenever he chooses is not a partnership, it is a leash with a handshake." }] },
        { label: "I'll think about it.", then: [{ say: "duke", lines: ["Take the winter. I shall be... around."] }, { flag: ["vane", "waiting"] }] }] },
      { clue: 1 }] },
    { id: "maud_eve", who: "maud", from: 27, hint: "Maud is waiting at the hall. It's nearly time.", steps: [
      { say: "maud", lines: ["Tomorrow the books close. Then the Reeve's Court will ask you some questions. Short ones.", "You'll pass. That isn't why I'm worried.", "I'm worried because after the examination there's a letter, and I know what's in it, and I'd rather you'd had a longer spring."] },
      { ask: "maud", text: "She straightens the abacus, which does not need it.", options: [
        { label: "I'm ready.", then: [{ say: "maud", lines: ["Mm. That's not wrong. Sleep. Count nothing."] }] },
        { label: "What's in the letter?", then: [{ say: "maud", lines: ["Not yet. I gave Edric my word, and my word is the only thing I have never had to count.", "After the examination. Whatever you're told, come to me first."] }] }] },
      { flag: ["examReady", true] }, { trust: ["maud", 1] }] },
  ];
  const SC = RECORDS.map(r => Object.assign({}, r, { run: c => K.play(r, c) }));
  const BY = Object.fromEntries(SC.map(x => [x.id, x])), CLUES = 6; // how many scenes hold a clue about who is buying the valley's debts (the tests count them)
  function available(who, s) {
    s.scenes = s.scenes || {}; s.flags = s.flags || {};
    return SC.find(x => x.who === who && !s.scenes[x.id] && s.day >= x.from && (x.to == null || s.day <= x.to) && K.need(x.need, s)) || null;
  }
  function pending(s) { return SC.filter(x => available(x.who, s) === x).length; }
  return { SC, BY, CLUES, RECORDS, available, pending, done: (s, id) => !!(s.scenes && s.scenes[id]) };
})();
