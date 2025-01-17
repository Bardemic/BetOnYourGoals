class Wage {
    constructor(user_id, wage_id, name, amount, created_at, authorization_id = null) {
        this.user_id = user_id;
        this.wage_id = wage_id;
        this.name = name;
        this.amount = amount;
        this.created_at = created_at;
        this.authorization_id = authorization_id;
        this.status = 'authorized';
    }

    cancel() {
        this.status = 'cancelled';
    }
}

module.exports = Wage;
