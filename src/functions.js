export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

export function is_mobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function randint(fromN, toN) {
  return Math.floor(Math.random() * (toN - fromN + 1)) + fromN;
}

export function playAndCatchError(mixer, message) {
  let playPromise = mixer.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
        console.log(message);
      });
  }
}