class Wage {
    constructor(user_id, wage_id, name, amount, created_at) {
        this.user_id = user_id;
        this.wage_id = wage_id;
        this.name = name;
        this.amount = amount;
        this.created_at = created_at;
    }
}

module.exports = Wage;
