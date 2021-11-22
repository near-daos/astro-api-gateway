package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.BountiesApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

@Steps
@RequiredArgsConstructor
public class BountiesApiSteps extends BaseSteps {
    private final BountiesApi bountiesApi;

    @Step("Getting bounty by bounty ID")
    public ResponseEntity<String> getBountyByID(String proposalId) {
        return bountiesApi.getBountyByID(proposalId);
    }
}
