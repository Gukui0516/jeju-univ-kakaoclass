// blackjack.js

//플레이어
let cardPlayer = [7, 5, 7, 4, 2, 1];
let playerSum= cardPlayer[0] + cardPlayer[1];

//딜러
let cardBank = [7, 5, 7, 1, 1, 2, 5];
let bankSum = cardBank[0] + cardBank[1];

let i = 2;

//카드 뽑기
while (bankSum < 17) {
  playerSum += cardPlayer[i]; //플레이어 카드 뽑기
  bankSum += cardBank[i];//딜러 카드 뽑기
  i++;
}

//출력
if (playerSum > 21) {
  console.log('You lost');
}
console.log(`You have ${playerSum} points`);
console.log(`Bank have ${bankSum} points`);

//승패 결정
if (bankSum > 21 || (playerSum <= 21 && playerSum > bankSum)) {
  console.log('You win');
}else if(playerSum === bankSum || (playerSum > 21 && bankSum > 21)) {
  console.log('You draw'); //무승부 조건 추가
} else {
  console.log('Bank wins');
} 
