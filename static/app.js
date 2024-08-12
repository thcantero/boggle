class BoggleGame{
    // Make a new game at this DOM id
    
    constructor(boardId, secs=60){
        this.secs = secs; //game length
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $('#' + boardId);

        //tick every 1000 msecs
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on('submit', this.handleSubmit.bind(this));
    }

    //Add word to list of words
    showWord(word){
        $('.words', this.board).append($('<li>', {text:word}));
    }

    //show score in html
    showScore(){
        $(".score", this.board).text(this.score);
    }

    //show a message
    showMessage(msg, cls){
        $(".msg", this.board)
            .text(msg)
            .removeClass()
            .addClass(`msg ${cls}`);
    }

    //Handle submti: check if word is valid
    async handleSubmit(e){
        e.preventDefault();
        const $word = $('.word', this.board);

        let word = $word.val();
        if(!word) return;

        if(this.words.has(word)){
            this.showMessage(`Already found ${word}`, "err");
            return;
        }

        //Check if the word is valid
        const resp = await axios.get('/check-word', {params: {word: word}});
        if (resp.data.result === 'not-word'){
            this.showMessage(`${word} is not a valid English word`, "err");
        } else if(resp.data.result === 'not-on-board'){
            this.showMessage(`${word} is not a valid word on this board`, "err");
        } else {
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok")
        }

        $word.val('').focus();
    }

    //Update timer in DOM
    showTimer(){
        $('.timer', this.board).text(this.secs);
    }

    //tick: handle a second passing in time
    async tick(){
        this.secs -=1;
        this.showTimer();

        if(this.secs ===0){
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    //End Game: Update score and message
    async scoreGame() {
        $('.add-word', this.board).hide();
        const resp = await axios.post('/post-score', {score: this.score});
        if(resp.data.brokeRecord) {
            this.showMessage(`New record ${this.score}`, 'ok');
        } else {
            this.showMessage(`Final score: ${this.score}`, 'ok');
        }
        }
}