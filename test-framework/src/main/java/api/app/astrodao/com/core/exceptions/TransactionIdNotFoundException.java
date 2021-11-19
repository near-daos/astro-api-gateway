package api.app.astrodao.com.core.exceptions;

public class TransactionIdNotFoundException extends RuntimeException {
    public TransactionIdNotFoundException(String message) {
        super(message);
    }
}
