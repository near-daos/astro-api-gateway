package api.app.astrodao.com.core.exceptions;

public class NotEnoughBalanceExecution extends RuntimeException {
    public NotEnoughBalanceExecution(String message) {
        super(message);
    }
}
