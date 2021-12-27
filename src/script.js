const currencyStr = `EUR,CHF,NOK,CAD,RUB,GBP,MXN,CNY,ISK,KRW,HKD,CZK,BGN,BRL,USD,IDR,SGD,PHP,RON,HUF,ILS,THB,SEK,NZD,AUD,DKK,HRK,PLN,TRY,INR,MYR,ZAR,JPY`;

window.addEventListener('load', () => init());

function init() {
    const currencyArr = currencyStr.split(',');
    const changeBtn = document.querySelector('#btn-change')
    const shadow = document.querySelector('.shadow')
    let timeout;

    const blocks = [];

    function inProgress() {
        shadow.classList.toggle('off');
        shadow.classList.toggle('on');
        changeBtn.classList.toggle('off');
        changeBtn.classList.toggle('on');
    }

    function inquire(inputId) {
        console.log(blocks[0].value, blocks[1].value, inputId);

        if (blocks[0].value !== blocks[1].value) {
            timeout = setTimeout(() => {
                inProgress();
            }, 500);
            console.log(timeout);
            API.request(blocks[0].value, blocks[1].value, inputId, answer);
        }
    };

    function round(x) {
        return Math.round(x * 10000) / 10000;
    }

    function answer(rates, inputId) {
        clearTimeout(timeout);
        if(timeout === 0) {
            // inProgress();
        } 
        
        console.log(inputId)

        let factor = 0;
        for (let x of Object.values(rates)) {
            factor = x;
            console.log(factor, blocks[0].inputField.value, blocks[1].inputField.value);
            blocks[1].inputField.value = round(blocks[0].inputField.value * factor);
            blocks[0].rateField.innerText = `1 ${blocks[0].value} = ${round(factor) + ' ' + blocks[1].value}`
            if (factor < 1) {
                factor = 1 / factor;
                blocks[1].rateField.innerText = `1 ${blocks[1].value} = ${round(factor) + ' ' + blocks[0].value}`
            }
        }
    }

    ["RUB", "USD"].forEach((currency, index) => {
        const currencyInput = new CurrencyInput(index + 1, currencyArr, currency, inquire);
        blocks.push(currencyInput);
    });
    inquire(0);

    changeBtn.addEventListener('click', (e) => {
        console.log(e.currentTarget);
        blocks.reverse();
        blocks[0].inputField.value = blocks[1].inputField.value
        changeBtn.parentElement.insertBefore(blocks[0].container, changeBtn);
        let title = blocks[0].container.querySelector('.title');
        title.innerText = 'У меня есть';
        changeBtn.parentElement.append(blocks[1].container);
        title = blocks[1].container.querySelector('.title');
        title.innerText = 'Хочу приобрести';
        inquire();
    })

    console.log(blocks);
}





class CurrencyInput {
    constructor(inputId, currencyList, defaultValue, callback) {
        this.value = defaultValue;
        const block = document.querySelector(`#block-${inputId}`);
        this.container = block;
        this.inputField = block.querySelector(`#input-${inputId}`);
        this.inputField.value = 1;
        this.rateField = block.querySelector('.rate');
        const select = block.querySelector('select');
        const btns = block.querySelectorAll('.btn:not(select)');
        this.menu = block.querySelector('.menu');
        // callback(inputId);

        select.addEventListener('change', () => {
            block.querySelector('.selected').classList.remove('selected');
            select.classList.add('selected');
            this.value = select.value;
            callback(inputId);
        })

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                block.querySelector('.selected').classList.remove('selected');
                btn.classList.add('selected');
                this.value = btn.innerText;
                callback(inputId);
            })
        })

        currencyList.forEach((currencyText) => {
            const option = document.createElement('option');
            option.innerText = currencyText;
            select.append(option);
        });

        const input = block.querySelector('input')
        input.addEventListener('change', (e) => {
            this.inputField.value = e.target.value;
            console.log(this.inputField)
            callback(inputId);
        })

    }

}

const API = {
    async request(base, symbols, inputId, callback) {
        console.log(base, symbols, callback);
        try {
            res = await fetch(`https://api.exchangerate.host/latest?base=${base}&symbols=${symbols}`)
            data = await res.json();
            callback(data.rates, inputId);
        } catch (e) {
            console.log(e.message)
            err = document.querySelector('.error')
            err.classList.toggle('on');
            err.classList.toggle('off');
            err.firstElementChild.innerText = `${e.message}`
            close = err.querySelector('.button');
            console.log(close)
            close.addEventListener('click', () => {
                err.classList.toggle('on');
                err.classList.toggle('off');
            })

        }
    }
}

