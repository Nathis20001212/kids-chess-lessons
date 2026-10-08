/*
 * Chapter 1: Activity beats Material
 * Source game: Cheparinov vs Vallejo Pons, Dresden Olympiad 2008 (from move 19)
 * Move format: [SAN, [[ "Book" | "Coach", "comment" ], ...]]  (comments optional)
 * Variations: "at" = index in mainLine of the move the variation replaces.
 * Quiz: "at" = index in mainLine; the position BEFORE that move is shown.
 */
(function(){
"use strict";
const START = "q1bk1b1r/1p1n1ppp/4p3/3pP3/3B1P2/1RQ5/P1P3PP/5RK1 w - - 0 19";
const B = "Book", C = "Coach";
const MAIN = [
 ["f5",[[B,"The idea behind this move is two-fold. First, ...b6 gives Black's c8-Bishop a square to develop. At the same time, it opens the chance to develop the f8-Bishop to c5. Even though material is unbalanced, Black's main problem is piece activity, so this pawn break is a very dynamic approach."]]],
 ["b6",[[C,"Black doesn't try to save his passive position with static defence. With ...b6 he chooses a plan to activate his pieces. In this position, activity becomes more important than the material count."]]],
 ["fxe6",[[B,"White exchanges pawns on the kingside to damage Black's structure. But Black turns this into a chance to activate his pieces."]]],
 ["fxe6"],
 ["Qe3",[[C,"The Queen comes to e3 and keeps control of the kingside and central squares. White's main asset is still the initiative."]]],
 ["Qc6"],["Rc3"],
 ["Bc5!",[[B,"This is one of the key positional decisions of the game. Black does not stay passive to protect material. He brings the Bishop to an active square."],[C,"With ...Bc5, Black shows an important principle: in some positions, activating your pieces is worth more than saving material. Next, Black is even ready to give up kingside pawns to gain activity."]]],
 ["Rf7"],["Ba6"],
 ["Bxc5",[[C,"White exchanges Black's active Bishop. But this brings Black's b-pawn to c5, creating a strong pawn mass in the centre."]]],
 ["bxc5"],
 ["Qg5+",[[C,"White keeps trying to hold the initiative with checks. But these checks don't turn into a long-term attack."]]],
 ["Kc8"],
 ["Qxg7",[[C,"White grabs another pawn. Materially it looks attractive, but positionally Black's pieces have become very active."]]],
 ["Rd8",[[B,"Black's Bishop and Knight together are worth 6 points, about the same as White's Rook plus a pawn. But in this position Black has a big advantage. White's initiative is gone, and now it is Black who has attacking chances. Many of White's pawns have become weaknesses."]]],
 ["Qxh7?",[[B,"White takes yet another pawn. But this is an important practical mistake. While collecting material, White forgets about his King's safety."]]],
 ["d4?",[[B,"Black misses a chance to win immediately. ...d4 is a good move, but it is not an instant win."]]],
 ["Rg3",[[C,"White puts his Rook on the third rank to defend. Now the Rook is a defender instead of an attacker. This is the key turning point in the battle of Rook against minor pieces."]]],
 ["c4",[[B,"Black's mobile pawns are a huge asset. As the c-pawn and d-pawn advance, the Rook finds no active targets."]]],
 ["Rf1"],["Qc5"],["Kh1"],
 ["Qxe5",[[C,"Black takes the e5-pawn. Now Black wins material and also destroys White's central pawns. White's counterplay is greatly reduced."]]],
 ["Rg8",[[C,"White brings the Rook to the eighth rank to attack Black's back rank. This is one of White's last active attempts."]]],
 ["Bb7"],
 ["Rxd8+",[[C,"White exchanges off Black's last Rook. The practical point is that one of Black's major pieces is gone. But afterwards, Black's Bishop and Knight work together very well against White's remaining Rook."]]],
 ["Kxd8"],["Qh4+"],["Kc7"],["Re1"],["Qg7"],["Qf2"],
 ["e5",[[B,"This is a typical position: two minor pieces completely dominate a Rook. White has no active plan, and Black can slowly improve his position. Because of threats against the White King, White's Rook can hardly move freely."]]],
 ["Qe2"],
 ["Bc6",[[C,"The Bishop comes to c6 and controls the important diagonals. Black doesn't rush into any tactic. First he puts his pieces on their best squares and tightens the position."]]],
 ["a4"],["c3"],["a5"],["e4"],["Rd1"],
 ["Nc5",[[C,"The Knight comes to c5 and controls central and queenside squares. Even White's passed a-pawn cannot disturb Black's well-coordinated pieces."]]],
 ["a6"],["e3"],["Qf1"],
 ["Ne6",[[B,"Black now prepares to push the e-pawn further. White's Queen and Rook are both tied down to defence."]]],
 ["Rb1"],
 ["e2",[[C,"This is the decisive passed-pawn phase. The e2-pawn is very close to becoming a Queen. White's Rook must now stop this pawn."]]],
 ["Qf2"],["Qg4"],
 ["Qf7+",[[C,"White tries to create counterplay with checks. But these checks don't change Black's winning setup."]]],
 ["Kd6"],["Qf2"],
 ["Kc5",[[C,"Black brings his King to a more active square. King activity, passed pawns and teamwork between the minor pieces leave White with almost no defence."]]],
 ["Qg3"],
 ["Qxg3",[[C,"Black forces the Queen exchange. Now it becomes a pure imbalance ending: White's Rook against Black's Bishop, Knight and dangerous pawns."]]],
 ["hxg3",[[C,"With the Queens gone, the strength of Black's minor pieces is even clearer. White's King and Rook are forced to deal with the passed pawns."]]],
 ["d3"],["cxd3"],
 ["c2",[[C,"Although White captured on d3, Black pushes the c-pawn to c2. Now the promotion threat is very real."]]],
 ["Rc1"],
 ["Kd4",[[C,"Black's King moves to the centre to support the c-pawn. The Rook on c1 is tied down."]]],
 ["Kg1"],
 ["Ke3",[[C,"In the final position, Black's King, Bishop, Knight and passed pawns all work together. White has no real counterplay, so White resigns."]]]
];
const QA4 = [B,"This is the immediate winning move. The White King is very exposed, so Black's Queen and minor pieces combine for a decisive attack."];
const VARS = [
 {at:2, title:"What if White played 20.Bxb6+ instead of 20.fxe6?", moves:[["Bxb6+"],["Nxb6"],["Rxb6"],["Qa3",[[B,"In this tactical line White tries to win material, but Black's Queen comes to a3 and puts direct pressure on the White King. Black gets good attacking chances."]]]]},
 {at:7, title:"What if Black played 22...Nc5 instead of 22...Bc5?", moves:[["Nc5"],["Rf7",[[B,"In this greedy line, White's Rook becomes very active on the seventh rank. Black's pieces lose their teamwork and White gets the initiative back."]]]]},
 {at:16, title:"The better defence: 27.h3 instead of 27.Qxh7", moves:[["h3",[[B,"This is the best defensive choice. White gives his King some breathing room."]]],["c4",[[B,"Even then, Black can push ...c4 and ...d4. Thanks to his connected, mobile pawns and active pieces, Black would still be very comfortable."]]]]},
 {at:17, title:"The missed win: 27...Qa4! (if 28.Rf2)", moves:[["Qa4!",[QA4]],["Rf2"],["Qd4",[[B,"Black increases the direct pressure on the White King. Next, ...Qd1+ is the main threat."]]]]},
 {at:17, title:"The missed win: 27...Qa4! (if 28.Rcf3)", moves:[["Qa4!",[QA4]],["Rcf3"],["Qd4+"],["Rf2"],["Qd1+",[[B,"In this line the White King has very few safe squares. The teamwork of Black's Queen, Bishop and Knight is decisive."]]]]}
];
const INTRO = "Welcome to Chapter 1: Activity beats Material. In this position, Black's pieces are passive and stuck at the back. Watch how Black brings them to life and wins the game.";
const ENDTXT = "White resigns. Black wins! Now try the evaluation to test what you learned.";

const QUIZ = [
 {type:"move", at:7, ans:"Bc5",
  q:"You are Black. Your f8-Bishop is still asleep. Play the move that wakes it up and makes it active, instead of just guarding material.",
  hint:"Find a diagonal for the f8-Bishop that points at the White King on g1.",
  ok:"Correct! ...Bc5! The Bishop becomes active and aims straight at the White King.",
  wrong:{Nc5:"After ...Nc5, White plays Rf7 and grabs the seventh rank. The initiative goes back to White."}},
 {type:"move", at:16, ans:"h3",
  q:"Now you are White. It's tempting to grab the h7-pawn, but how safe is your King? Play the best defensive move.",
  hint:"Your King needs a little escape square off the back rank.",
  ok:"Correct! h3 gives your King breathing room.",
  wrong:{Qxh7:"That was the mistake in the real game! You win a pawn but lose King safety."}},
 {type:"move", at:17, ans:"Qa4",
  q:"You are Black. White's Queen is busy collecting pawns on h7 and the White King is exposed. Find the Queen move that wins right away!",
  hint:"If your Queen goes to a4, it can then attack the King through d4 and d1.",
  ok:"Brilliant! ...Qa4! threatens ...Qd4 check and ...Qd1 check. Even the grandmaster missed this in the game!",
  wrong:{d4:"...d4 is a good move, and it was played in the game, but it doesn't win right away. Use your Queen!"}},
 {type:"move", at:47, ans:"e2",
  q:"You are Black. You have dangerous passed pawns, and White's Queen and Rook are stuck defending. What is the strongest move toward promotion?",
  hint:"Look at the pawn on e3.",
  ok:"Correct! The pawn on e2 is one step from becoming a Queen. White's Rook must now stop it.",
  wrong:{}},
 {type:"move", at:55, ans:"Qxg3",
  q:"You are Black. White's Queen has come to g3. If the Queens are traded, you reach a Bishop, Knight and passed pawns versus Rook ending. What do you play?",
  hint:"Trading Queens makes your minor pieces even stronger.",
  ok:"Correct! With the Queens gone, White has no counterplay and your pawns run toward promotion.",
  wrong:{}},
 {type:"mcq", at:34,
  q:"Black has a Bishop and a Knight, and White has a Rook. Who is better here, and why?",
  options:["White, because a Rook is always stronger","Black, because the pieces are active and White's Rook has no plan","Equal, because the points are about the same"], correct:1,
  ok:"Correct! The two minor pieces dominate the Rook. Activity is what counts.",
  no:"Not quite. Counting points isn't enough. Black's pieces are active, and White's Rook has no active plan."},
 {type:"mcq", at:64,
  q:"What is the main lesson of this chapter?",
  options:["Always grab every pawn you can","In some positions, piece activity matters more than material","Never exchange Queens"], correct:1,
  ok:"Excellent! Black won with active pieces, even though White kept grabbing material.",
  no:"Not quite. White grabbed pawns but lost. Black won with active pieces."}
];


window.CHAPTER = {
  id: "chapter-01",
  title: "Chapter 1: Activity beats Material",
  subtitle: "Cheparinov vs Vallejo Pons, Dresden Olympiad 2008",
  white: "Cheparinov",
  black: "Vallejo Pons",
  startFen: START,
  mainLine: MAIN,
  variations: VARS,
  intro: INTRO,
  ending: ENDTXT,
  quiz: QUIZ
};
})();
