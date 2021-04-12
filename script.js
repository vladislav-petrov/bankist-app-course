'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-02-01T17:01:17.194Z',
    '2021-02-02T18:36:17.929Z',
    '2021-02-03T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAccount;
let sorted = false;
let timer;

const createUsernames = function(accounts) {
  accounts.forEach(account => {
    account.username = account.owner.toLowerCase().split(' ').map(n => n.slice(0, 1)).join('');
  });
}

const displayMovements = function(account, sort = false) {
  containerMovements.innerHTML = '';
  const movementsNew = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

  movementsNew.forEach(function(movement, index) {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const formattedMovement = new Intl.NumberFormat(account.locale, {
      style: 'currency',
      currency: account.currency
    }).format(movement);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
        <div class="movements__date">${formatDate(new Date(account.movementsDates[index]))}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

const calcDisplayBalance = function(account) {
  account.balance = account.movements.reduce((acc, movement) => acc + movement, 0);
  const formattedBalance = new Intl.NumberFormat(account.locale, {
    style: 'currency',
    currency: account.currency
  }).format(account.balance);
  labelBalance.textContent = `${formattedBalance}`;
}

const calcDisplaySummary = function(account) {
  const sumIn = account.movements
  .filter(movement => movement > 0)
  .reduce((acc, movement) => acc + movement, 0);
  
  const sumOut = account.movements
  .filter(movement => movement < 0)
  .map(movement => Math.abs(movement))
  .reduce((acc, movement) => acc + movement, 0);

  const sumInterest = account.movements
  .filter(movement => movement > 0)
  .map(movement => movement * account.interestRate / 100)
  .filter(movement => movement >= 1)
  .reduce((acc, movement) => acc + movement, 0);

  const formattedSumIn = new Intl.NumberFormat(account.locale, {
      style: 'currency',
      currency: account.currency
    }).format(sumIn);


  const formattedSumOut = new Intl.NumberFormat(account.locale, {
    style: 'currency',
    currency: account.currency
  }).format(sumOut);;

  const formattedSumInterest = new Intl.NumberFormat(account.locale, {
    style: 'currency',
    currency: account.currency
  }).format(sumInterest);;

  labelSumIn.textContent = `${formattedSumIn}`;
  labelSumOut.textContent = `${formattedSumOut}`;
  labelSumInterest.textContent = `${formattedSumInterest}`;
}

const updateUI = function(account) {
  // Display movements
  displayMovements(account);
  // Display balance
  calcDisplayBalance(account);
  // Display summary
  calcDisplaySummary(account);
}

const clearInputFieldsLogin = function() {
  inputLoginUsername.value = '';
  inputLoginPin.value = '';
  inputLoginUsername.blur();
  inputLoginPin.blur();
}

const clearInputFieldsTransfer = function() {
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();
}

const clearInputFieldsLoan = function() {
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
}

const clearInputFieldsClose = function() {
  inputCloseUsername.value = '';
  inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
}

const formatDate = function(date, newFormat = true) {
  const options1 = {
    hour: 'numeric',
    minute: 'numeric'
  };

  const options2 = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };

  if (newFormat === true) {
    const calcDaysPassed = (date1, date2 = new Date()) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(date);

    const hourMinute = new Intl.DateTimeFormat(currentAccount.locale, options1).format(date);

    if (daysPassed === 0) return `Today, ${hourMinute}`;
    if (daysPassed === 1) return `Yesterday, ${hourMinute}`;
    if (daysPassed < 7) return `${daysPassed} days ago, ${hourMinute}`;
    if (daysPassed === 7) return `A week ago, ${hourMinute}`;
  }

  return new Intl.DateTimeFormat(currentAccount.locale, options2).format(date);
}

const startLogOutTimer = function() {
  const tick = function() {
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }

    const minutes = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const seconds = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${minutes}:${seconds}`;
    time--;
  }
  
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

const resetTimer = function() {
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
}

// EVENT LISTENERS

btnLogin.addEventListener('click', function(event) {
  event.preventDefault();  // Prevent form from submitting
  currentAccount = accounts.find(account => account.username === inputLoginUsername.value);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    const now = new Date();
    labelDate.textContent = formatDate(now, false);
    // Clean input fields
    clearInputFieldsLogin();
    clearInputFieldsTransfer();
    clearInputFieldsLoan();
    clearInputFieldsClose();
    resetTimer(timer);
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function(event) {
  event.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(account => account.username === inputTransferTo.value);

  if (receiverAccount && receiverAccount.username !== currentAccount.username && typeof amount === 'number' && amount > 0 && currentAccount.balance >= amount) {
    // Doing the transfer
    currentAccount.movements.push(amount * (-1));
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movements.push(amount);
    receiverAccount.movementsDates.push(new Date().toISOString());
    // Clear input fields
    clearInputFieldsTransfer();
    resetTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function(event) {
  event.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (typeof amount === 'number' && amount > 0 && currentAccount.movements.some(movement => movement >= amount * 0.1)) {
    setTimeout(function() {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      clearInputFieldsLoan();
      resetTimer();
      updateUI(currentAccount);
    }, 2500);
  };
});

btnClose.addEventListener('click', function(event) {
  event.preventDefault();
  const username = inputCloseUsername.value;

  if (currentAccount.username === username && currentAccount.pin === Number(inputClosePin.value)) {
    const index = accounts.findIndex(account => account.username === username);
    // Delete account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
    // Display message
    labelWelcome.textContent = `Log in to get started`;
    clearInterval(timer);
  }
});

btnSort.addEventListener('click', function(event) {
  event.preventDefault();
  resetTimer();
  if (sorted === false) {
    displayMovements(currentAccount, true);
    sorted = true;
  } else {
    displayMovements(currentAccount, false);
    sorted = false;
  }
});

createUsernames(accounts);
