// Interdimensional Cocktail Portal (c) 2022 Christian Schüler
console.log("Interdimensional Cocktail Portal booting...");
/** @class Pump
*/
var Pump = /** @class */ (function () {
    function Pump(gpio) {
        this.gpioId = gpio;
    }
    Pump.flow_dl_m = 1;
    return Pump;
}());
var IngredientPump = /** @class */ (function () {
    function IngredientPump(name, isAlcohol, gpioId) {
        console.log("Ingredient: ".concat(name, ", ").concat(isAlcohol ? "alcohol" : "no alcohol", ", GPIO ID: ").concat(gpioId));
    }
    IngredientPump.flow_dl_m = 1;
    return IngredientPump;
}());
/** @class InterdimensionalCocktailPortal
*/
var InterdimensionalCocktailPortal = /** @class */ (function () {
    function InterdimensionalCocktailPortal() {
        this.drinkRepository = [
            { name: 'vodka', isAlcohol: true, gpioId: 2 },
            { name: 'lemon-juice', isAlcohol: false, gpioId: 3 },
            { name: 'strawberry-juice', isAlcohol: false, gpioId: 4 }
        ];
        this.pumps = [];
        for (var index in this.drinkRepository) {
            var p = new IngredientPump(this.drinkRepository[index].name, this.drinkRepository[index].isAlcohol, this.drinkRepository[index].gpioId);
            this.pumps.push(p);
        }
    }
    InterdimensionalCocktailPortal.prototype.run = function () {
        console.log("Interdimensional Cocktail Portal run...");
    };
    return InterdimensionalCocktailPortal;
}());
var bot = new InterdimensionalCocktailPortal();
bot.run();
