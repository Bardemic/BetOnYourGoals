let users = [{'user_id': '1', 'email': 'a', 'password': 'a', 'username': 'a'}]

const getUsers = () => {
    return({ users });
};

const signup = (email, password, username) => {
    //check if user already exists
    if (users.find(user => user.email === email)) {
        return { error: 'User already exists' };
    } else {
        const user = { email, password, username, user_id: Math.random().toString(36).substring(2, 15) };
        users.push(user);
        return { message: 'User created successfully', user };
    }
};

const login = (email, password) => {
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        return { message: 'Login successful', user: { id: user.user_id, email: user.email, username: user.username } };
    } else {
        return { error: 'Invalid credentials' };
    }
};

module.exports = { signup, login, getUsers };