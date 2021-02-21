// Global variables:
let currentTheme = 0; // 0 Light theme // 1 Dark theme

let currency = document.getElementById("countryCurrency");  // Select 
let amDisp = document.querySelectorAll(".amountDisplay");
let input = document.querySelectorAll("form input");
const table = document.getElementById("data-table");

const tValues = {
    incomes: 0,
    expenses: 0,
    total: this.incomes - this.expenses,
    reload(){
        tValues.total = tValues.incomes - tValues.expenses;
    }
}

// Modal:
const modal = {
    open() {
        document.querySelector("#modal").
            classList.add("active");
    },
    close() {
        document.
            querySelector("#modal").
            classList.remove("active");

        form.clear();
    },
    alert(value){
        if(value == 0){
            document.
                querySelector("#alert").
                classList.remove("active");
        }
        else {
            document.querySelector("#alert").
                classList.add("active");
        }
    },
    edit(value){
        if (value == 0) {
            document.
                querySelector("#edit").
                classList.remove("active");
        }
        else {
            document.querySelector("#edit").
                classList.add("active");
        }
    },
    openEdit(len){
        let edit = document.querySelectorAll("tr")[len].getElementsByTagName("td");
        let input = document.querySelectorAll("#edit form input");

        input[0].value = edit[1].innerHTML;
        input[1].value = null;

        let date = edit[3].innerHTML;
        date = date.split("/");
        if (currency.value == "BRL") {
            input[2].value = `${date[2]}-${date[1]}-${date[0]}`;
        } else {
            input[2].value = `${date[2]}-${date[0]}-${date[1]}`;
        }

        document.getElementById("saveEdit").setAttribute("onclick", `transactions.editTable(${len})`);
        modal.edit(1);
    }
};

// Storage
const data = {
    transactions() {
        return JSON.parse(localStorage.getItem("transactions")) || [];
    },

    theme(){
        return localStorage.getItem("theme") || 0; 
    }, 

    currency() {
        return localStorage.getItem("currency") || "BRL"; 
    },

    setCurrency(){
        let value;
        (currency.value == "BRL") ? value = 0 : value = 1;
        localStorage.setItem("currency", value); // currency can be BRL (0) or USD (1)
    }, 

    setTheme(theme){
        localStorage.setItem("theme", theme); // theme can be 0 (light) or 1 (dark)
    }, 

    setTransactions(data){
        localStorage.setItem("transactions", JSON.stringify(data));
    },
}

// Application
const app = {
    // update values display (incomes, expenses, total)
    reload(incomes = 0, expenses = 0){
        let amount = document.querySelectorAll(".amountTb");

        tValues.incomes = incomes;
        tValues.expenses = expenses;

        for (let i = 0; i < amount.length; i++) {
            if (parseFloat(amount[i].innerHTML) > 0) {
                tValues.incomes += parseFloat(amount[i].innerHTML);
            }
            else {
                let res = parseFloat(amount[i].innerHTML);
                res *= -1;
                tValues.expenses += res;
            }
        }

        tValues.reload();

        if (
            currency.value == "BRL"
        ) {
            amDisp[0].innerHTML = formatting.currencyBRL(tValues.incomes);
            amDisp[1].innerHTML = formatting.currencyBRL(tValues.expenses * -1);
            amDisp[2].innerHTML = formatting.currencyBRL(tValues.total);
        }
        else {
            amDisp[0].innerHTML = formatting.currencyUSD(tValues.incomes);
            amDisp[1].innerHTML = formatting.currencyUSD(tValues.expenses * -1);
            amDisp[2].innerHTML = formatting.currencyUSD(tValues.total);
        }

        if (tValues.total >= 0) {
            amDisp[2].style.color = "#fff";
        } else {
            amDisp[2].style.color = "#e92929";
        }
    },

    reloadDate(){
        let date = document.querySelectorAll(".dateTb");

        for (let i = 0; i < date.length; i++) {
            date[i].innerHTML = formatting.reformatDate(date[i].innerHTML);
        }
    },

    // start app
    init(){
        theme(true);

        currency.selectedIndex = data.currency();

        let savedRows = data.transactions();
        for(let i = 0; i < savedRows.length; i++){
            transactions.addTable(
                savedRows[i].description,
                savedRows[i].amount,
                savedRows[i].date
            );
        }

        app.reload();
    }
}

// Form validation and structure
const form = {
    validate(){
        if (input[0].value.length == 0 ||
            input[1].value.length == 0 ||
            input[2].value.length == 0) {
            throw new Error("Os campos não podem estar em branco");
        }
        else {
            transactions.addTable(
                input[0].value,
                input[1].value,
                input[2].value);
        }
    },
    clear(){
        let input = document.querySelectorAll("form input");
        for (let i = 0; i < input.length; i++) {
            input[i].value = "";
        }
    }
}

// Table:
let allTransactions = [];
const transactions = {
    addTable(tDesc, tAmount, tDate) {
        modal.close();

        let len = table.rows.length;
        const removeTable = `<img src="assets/minus.svg" onclick="transactions.remTable(this, ${len})" title="Remover transação">`;
        const editTable = `<img src="assets/edit.svg" onclick="modal.openEdit(${len})" title="Editar transação">`;

        // Inserting new row
        let line = table.insertRow(len);

        // Inserting cells
        let info = new Array(5);
        info[0] = line.insertCell(0);
        info[1] = line.insertCell(1);
        info[2] = line.insertCell(2);
        info[3] = line.insertCell(3);
        info[4] = line.insertCell(4);

        // Filling data
        info[0].innerHTML = len;
        info[1].innerHTML = tDesc; // Description
        info[2].innerHTML = (parseFloat(tAmount).toFixed(2)).replace(/\./g, ','); // Amount
        info[3].innerHTML = formatting.date(tDate); // Date
        info[4].innerHTML = editTable + removeTable;

        info[2].classList.add("amountTb");
        info[3].classList.add("dateTb");

        if (input[1].value < 0) {
            info[2].classList.add("expenses");
        } else {
            info[2].classList.add("incomes");
        }

        if (allTransactions.length == 0) {
            allTransactions[0] = {
                description: tDesc,
                amount: (parseFloat(tAmount).toFixed(2)).replace(/\./g, ','),
                date: tDate
            }
        } else {
            allTransactions.push({
                description: tDesc,
                amount: (parseFloat(tAmount).toFixed(2)).replace(/\./g, ','),
                date: tDate
            });
        }

        app.reload();
        form.clear();

        data.setTransactions(allTransactions);
    },
    remTable(row, len) {
        // delete row
        let i = row.parentNode.parentNode.rowIndex;
        allTransactions.splice(
            len-1, 1
        );
        table.deleteRow(i);

        // update values display (incomes, expenses, total)
        app.reload();

        data.setTransactions(allTransactions);
        
        // update line numbers
        let numLines = document.querySelectorAll("#data-table tr td:first-child");
        for (let l = 0; l < table.rows.length; l++) {
            numLines[l].innerHTML = l + 1;
        }
    },
    deleteAll(){
        modal.alert(0);

        allTransactions = [];
        data.setTransactions(allTransactions);

        location.reload();
    },
    editTable(len){
        let edit = document.querySelectorAll("tr")[len].getElementsByTagName("td");
        let input = document.querySelectorAll("#edit form input");

        if (input[0].value.length == 0 ||
            input[1].value.length == 0 ||
            input[2].value.length == 0) {
            throw new Error("Os campos não podem estar em branco");
        } else {
            edit[1].innerHTML = input[0].value;
            edit[2].innerHTML = (parseFloat(input[1].value)).toFixed(2).replace(/\./g, ',');
            edit[3].innerHTML = formatting.date(input[2].value);
        }

        if (input[1].value < 0) {
            edit[2].style.color = "#e92929"
        } else {
            edit[2].style.color = "#3dd785"
        }

        allTransactions[len-1] = {
            description: input[0].value,
            amount: (parseFloat(input[1].value)).toFixed(2).replace(/\./g, ','),
            date: input[2].value
        };

        data.setTransactions(allTransactions);
        app.reload();
        modal.edit(0);
    }
};

// Formatting currency
const formatting = {
    currencyBRL(value){
        let options = {
            style: 'currency',
            currency: 'BRL'
        }
        return value.toLocaleString('pt-BR', options);
    },
    currencyUSD(value){
        let options = {
            style: 'currency',
            currency: 'USD'
        }
        return value.toLocaleString('en-US', options);
    },
    date(date){
        const splittedDate = date.split("-");
        if(currency.value == "BRL")
            return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
        else
            return  `${splittedDate[1]}/${splittedDate[2]}/${splittedDate[0]}`;
    },
    reformatDate(date){
        date = date.split("/");
        return `${date[1]}/${date[0]}/${date[2]}`;
    }
}

// Dark theme:
function theme(isStarting = false) { // change themes (between light - dark mode)
    // isStarting is false by default, so everytime that this function is called
    // without the true as parameter, it is going to just change the theme,
    // with that parameter, it will load the last theme used on this application
    if(isStarting){
        currentTheme = data.theme();
    } else {
        currentTheme = (currentTheme == 0) ? 1 : 0;
        data.setTheme(currentTheme);
    }

    let card = document.querySelectorAll(".card");
    if (currentTheme == 1) {
        document.querySelector("body").style.background = "#14242c";
        document.querySelector("#theme").src = '../assets/themeWhite.svg';

        for (let i = 0; i < 2; i++) {
            card[i].style.background = "#f0f2f5";
        }
    }
    else {
        document.querySelector("body").style.background = "#f0f2f5";
        document.querySelector("#theme").src = '../assets/themeBlack.svg';

        for (let i = 0; i < 2; i++) {
            card[i].style.background = "#fff";
        }        
    }
}

// Calling functions:
currency.onchange = () => {
    data.setCurrency();
    app.reload();
    app.reloadDate();
};

app.init();