package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.controllers.StatsApi;
import io.qameta.allure.Step;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

@Steps
@RequiredArgsConstructor
public class StatsApiSteps extends BaseSteps {
    private final StatsApi statsApi;

    @Step("Getting state for a DAO")
    public ResponseEntity<String> getStateForDao(String dao) {
        return statsApi.getStateForDao(dao);
    }

    @Step("Getting funds for a DAO")
    public ResponseEntity<String> getFundsForDao(String dao) {
        return statsApi.getFundsForDao(dao);
    }

    @Step("Getting bounties for a DAO")
    public ResponseEntity<String> getBountiesForDao(String dao) {
        return statsApi.getBountiesForDao(dao);
    }

    @Step("Getting NFTs for a DAO")
    public ResponseEntity<String> getNFTsForDao(String dao) {
        return statsApi.getNFTsForDao(dao);
    }

    @Step("Getting proposals for a DAO")
    public ResponseEntity<String> getProposalsForDao(String dao) {
        return statsApi.getProposalsForDao(dao);
    }
}
