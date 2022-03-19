// Modules

// BUDGET CONTROLLER
const budgetController = (() => {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = (type) => {
    let sum = 0;
    data.allItems[type].forEach((el) => {
      sum += el.value;
    });
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: (type, des, val) => {
      let newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: (type, id) => {
      let ids, index;

      ids = data.allItems[type].map((current) => current.id);

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: () => {
      data.allItems.exp.forEach((cur) => cur.calcPercentage(data.totals.inc));
    },

    getPercentages: () => {
      let allPerc = data.allItems.exp.map((cur) => {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: () => {
      console.log(data);
    },
  };
})();

// UI CONTROLLER

const UIController = (() => {
  const Domstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeList: ".income__list",
    expenseList: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePercLabel: ".item__percentage",
    dateLabel: '.budget__title--month'
  };

  const formatNumber = (num, type) => {
    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (
      (type === "exp" ? (sign = "-") : (sign = "+")) + " " + int + "." + dec
    );
  };

  let nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  return {
    getInput: () => {
      return {
        type: document.querySelector(Domstrings.inputType).value,
        description: document.querySelector(Domstrings.inputDescription).value,
        value: parseFloat(document.querySelector(Domstrings.inputValue).value),
      };
    },

    addListItem: (obj, type) => {
      let html, newHtml, newHtml2, newHtml3, element;

      // create Html string with placeholder text
      if (type === "inc") {
        element = Domstrings.incomeList;

        html = `<div class="item clearfix" id="inc-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
       <div class="item__value">%value%</div>
       <div class="item__delete"><button class="item__delete--btn"> 
       <i class="ion-ios-close-outline"></i>
       </button>
       </div> </div>
       </div>'`;
      } else if (type === "exp") {
        element = Domstrings.expenseList;

        html = `<div class="item clearfix" id="exp-%id%">
        <div class="item__description">%description%</div>
        <div class="right clearfix">
        <div class="item__value">%value%</div>
        <div class="item__percentage">21%</div>
        <div class="item__delete">
        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
        </div>
        </div>
        </div>`;
      }

      // replace the placeholder text

      // find optimized solution
      newHtml = html.replace("%id%", obj.id);
      newHtml2 = newHtml.replace("%value%", formatNumber(obj.value, type));
      newHtml3 = newHtml2.replace("%description%", obj.description);
      // insert the new html string

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml3);
    },

    deleteListItem: (selectorId) => {
      const el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: () => {
      let fields, fieldsArr;

      fields = document.querySelectorAll(
        `${Domstrings.inputDescription} , ${Domstrings.inputValue}`
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((current) => {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: (obj) => {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

       document.querySelector(Domstrings.budgetLabel).textContent = formatNumber(obj.budget, type);

        
      if(obj.budget === 0) {
        document.querySelector(Domstrings.budgetLabel).textContent = formatNumber(obj.budget);
      };
      
      document.querySelector(Domstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(Domstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
        

      if (obj.percentage > 0) {
        document.querySelector(Domstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(Domstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: (percentages) => {
      const fields = document.querySelectorAll(Domstrings.expensePercLabel);

   
      nodeListForEach(fields, (current, index) => {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: () => {
      let now, year, month, months;

         now = new Date();
         months = ['january', 'Febraury', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
         month = now.getMonth()
         year = now.getFullYear();
         document.querySelector(Domstrings.dateLabel).textContent = months[month] + ', ' + year;
        
    },

      changedType: () => {
        let fields = document.querySelectorAll(
          Domstrings.inputType + ',' +
          Domstrings.inputDescription + ',' +
          Domstrings.inputValue
        );

        nodeListForEach(fields, (cur) => {
            cur.classList.toggle('red-focus');
            // cur.classList.toggle('red')
        });

        document.querySelector(Domstrings.inputBtn).classList.toggle('red')
      },


    getDomstrings: () => {
      return Domstrings;
    },
  };
})();

// GLOBAL APP CONTROLLER
const appController = ((budgetCtrl, UICtrl) => {
  const setupEventListeners = () => {
    const Dom = UICtrl.getDomstrings();
    document.querySelector(Dom.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        ctrlAddItem();
      }
    });

    document
      .querySelector(Dom.container)
      .addEventListener("click", ctrlDeleteItem);

      document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changedType)
  };

  const updateBudget = () => {
    // calculate the budget
    budgetCtrl.calculateBudget();

    //  return the budget
    let budget = budgetCtrl.getBudget();

    // display budget
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();

    // 2 Read percentages from the budget controller
    let percentages = budgetCtrl.getPercentages();

    // 3 update the ui with the new percentages;
    UIController.displayPercentages(percentages);
  };

  const ctrlAddItem = () => {
    let input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );

      UICtrl.addListItem(newItem, input.type);

      UIController.clearFields();

      updateBudget();

      //  calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = (e) => {
    let itemId, splitId, type, Id;

    itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      Id = parseInt(splitId[1]);

      // delete the item from the data structure
      budgetCtrl.deleteItem(type, Id);

      // delete the item from the user interface
      UIController.deleteListItem(itemId);

      // update and show the new budget
      updateBudget();
    }
  };

  return {
    init: () => {
      console.log("application has started");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
      UIController.displayMonth();
    },
  };
})(budgetController, UIController);
appController.init();

/*
SHA256:Y43pHek82JA9PZBcML/dEfCC5z8d7bBbTFJOR4QjZY8 vickjunior2002@gmail.com
The key's randomart image is:
+---[RSA 4096]----+
|          o..o++o|
|         . =o.++.|
|          +..+E+=|
|         * +oo.=+|
|        S * +.+.=|
|       o O o ..Bo|
|        o *   .o=|
|           .   o.|
|              .  |
*/
