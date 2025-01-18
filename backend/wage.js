class Wage {
    constructor(user_id, wage_id, name, amount, created_at, authorization_id = null, llm_checker, frequency, frequency_unit) {
        this.user_id = user_id;
        this.wage_id = wage_id;
        this.name = name;
        this.amount = amount;
        this.created_at = created_at;
        this.authorization_id = authorization_id;
        this.status = 'authorized';
        this.llm_checker = llm_checker;
        this.frequency = frequency;
        this.frequency_unit = frequency_unit;
        this.completions = []; // Array of completed dates
    }

    cancel() {
        this.status = 'cancelled';
    }

    addCompletion(date) {
        if (!this.completions.includes(date)) {
            this.completions.push(date);
        }
    }
}

module.exports = Wage;
