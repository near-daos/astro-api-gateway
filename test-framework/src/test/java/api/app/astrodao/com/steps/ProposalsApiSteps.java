package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.ProposalsApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

@Steps
@RequiredArgsConstructor
public class ProposalsApiSteps extends BaseSteps {
    private final ProposalsApi proposalsApi;

    @Step("Getting proposal by proposal ID")
    public ResponseEntity<String> getProposalByID(String proposalId) {
        return proposalsApi.getProposalByID(proposalId);
    }
}
