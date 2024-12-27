export default function LoginPage() {
    return (
        <div>
            <h1>Login</h1>
            <form>
                <label>
                    Email:
                    <input type="email" name="email" required />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" name="password" required />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
