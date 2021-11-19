package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.TransactionsApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

@Steps
@RequiredArgsConstructor
public class TransactionsSteps {
    private final TransactionsApi transactionsApi;

    @Step("User triggers callback endpoint")
    public ResponseEntity<String> triggerCallback(String accountId, String transactionHashes) {
        return transactionsApi.triggerCallback(accountId, transactionHashes);
    }
}
