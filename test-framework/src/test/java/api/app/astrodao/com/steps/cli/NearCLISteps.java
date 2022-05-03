package api.app.astrodao.com.steps.cli;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.dto.cli.ActProposalNearCliResponse;
import api.app.astrodao.com.core.dto.cli.AddProposalResponse;
import api.app.astrodao.com.core.dto.cli.CLIResponse;
import api.app.astrodao.com.core.dto.cli.dao.Config;
import api.app.astrodao.com.core.dto.cli.dao.NewDAODto;
import api.app.astrodao.com.core.dto.cli.dao.Policy;
import api.app.astrodao.com.core.utils.CLIUtils;
import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.core.utils.WaitUtils;
import io.qameta.allure.Step;
import io.restassured.response.Response;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;

import static api.app.astrodao.com.core.Constants.CLICommands.*;
import static api.app.astrodao.com.core.utils.JsonUtils.writeValueAsString;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.apache.commons.lang3.StringUtils.EMPTY;
import static org.awaitility.Awaitility.await;

@Steps
public class NearCLISteps {

    @Step("User waits '{aggregationTimeout}' seconds for data to be aggregated")
    public void waitForAggregation(int aggregationTimeout) {
        WaitUtils.sleep(Duration.ofSeconds(aggregationTimeout));
    }

    @Step("User waits '{aggregationTimeout}' seconds for data to be aggregated")
    public Response waitForAggregation(int aggregationTimeout,
                                                     Supplier<Response> supplier,
                                                     int httpStatus) {
        AtomicReference<Response> response = new AtomicReference<>();
        await().timeout(aggregationTimeout, TimeUnit.SECONDS)
                .alias("Failed because aggregation timeout didn't work or there's a delay on the blockchain")
                .pollInterval(Duration.ofSeconds(1))
                .until(() -> {
                    response.set(supplier.get());
                    return response.get().getStatusCode() == httpStatus;
                });
        return response.get();
    }

    @Step("User waits '{aggregationTimeout}' seconds for data to be aggregated")
    public Response waitForAggregation(int aggregationTimeout, Supplier<Response> supplier) {
        AtomicReference<Response> response = new AtomicReference<>();
        await().timeout(aggregationTimeout, TimeUnit.SECONDS)
                .alias("Failed because aggregation timeout didn't work or there's a delay on the blockchain")
                .pollInterval(Duration.ofSeconds(1))
                .until(() -> {
                    response.set(supplier.get());
                    return response.get().getStatusCode() == HTTP_OK;
                });
        return response.get();
    }

    @Step("User calls 'view {accountId} get_config' in NEAR CLI")
    public Config getDaoConfig(String accountId) {
        String command = String.format(GET_DAO_CONFIG, accountId);
        List<String> output = CLIUtils.execute(command);
        output.removeIf(p -> p.contains("View call"));
        return JsonUtils.readValue(String.join(EMPTY, output), Config.class);
    }

    @Step("User calls 'view {accountId} get_policy' in NEAR CLI")
    public Policy getDaoPolicy(String accountId) {
        String command = String.format(GET_DAO_POLICY, accountId);
        List<String> output = CLIUtils.execute(command);
        output.removeIf(p -> p.contains("View call"));
        return JsonUtils.readValue(String.join(EMPTY, output), Policy.class);
    }

    @Step("User calls 'view {accountId} get_proposal' in NEAR CLI")
    public <T> T getProposalById(String accountId, int proposalId, Class<T> clazz) {
        Map<String, Integer> idMap = Map.of("id", proposalId);
        String command = String.format(GET_PROPOSAL_BY_ID, accountId, writeValueAsString(idMap));
        List<String> output = CLIUtils.execute(command);
        output.removeIf(p -> p.contains("View call"));
        return JsonUtils.readValue(String.join(EMPTY, output), clazz);
    }

    @Step("User calls 'view {accountId} get_bounty' in NEAR CLI")
    public <T> T getBountyById(String accountId, int bountyId, Class<T> clazz) {
        Map<String, Integer> idMap = Map.of("id", bountyId);
        String command = String.format(GET_BOUNTY_BY_ID, accountId, writeValueAsString(idMap));
        List<String> output = CLIUtils.execute(command);
        output.removeIf(p -> p.contains("View call"));
        return JsonUtils.readValue(String.join(EMPTY, output), clazz);
    }

    @Step("User calls 'sputnikv2.testnet create' in NEAR CLI")
    public CLIResponse createNewDao(NewDAODto newDaoDto, String accountId, long gasValue, float deposit) {
        String command = String.format(
                CREATE_NEW_DAO, writeValueAsString(newDaoDto), accountId, gasValue, deposit
        );
        List<String> output = CLIUtils.execute(command);
        return CLIResponse.fillDto(output);
    }

    @Step("User calls 'add_proposal' in NEAR CLI")
    public <T> AddProposalResponse addProposal(String daoName, T proposal,
                                               String accountId, long gasValue, float deposit) {
        String command = String.format(
                ADD_NEW_PROPOSAL, daoName, writeValueAsString(proposal), accountId, gasValue, deposit
        );
        List<String> output = CLIUtils.execute(command);
        return AddProposalResponse.fillDto(output);
    }

    @Step("Call NEAR CLI method 'act_proposal' to vote for a proposal")
    public <T> ActProposalNearCliResponse voteForProposal(String daoName, T voteJsonObject,
                                                          String accountId, long gasValue) {
        String command = String.format(
                VOTE_FOR_PROPOSAL, daoName, writeValueAsString(voteJsonObject), accountId, gasValue);
        List<String> nearCliConsoleOutput = CLIUtils.execute(command);

        return ActProposalNearCliResponse.fillDto(nearCliConsoleOutput);
    }

    @Step("Call NEAR CLI method 'tx-status' for transaction")
    public String getTxStatus(String tx, String accountId) {
        String command = String.format(GET_TX_STATUS, tx, accountId);
        List<String> output = CLIUtils.execute(command);

        output.removeIf(p -> p.contains(String.format("Transaction %s:", accountId)));
        return String.join(EMPTY, System.lineSeparator());
    }
}
