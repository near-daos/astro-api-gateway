package api.app.astrodao.com.steps;

import api.app.astrodao.com.core.annotations.Steps;
import api.app.astrodao.com.core.dto.cli.ActProposalNearCliResponse;
import api.app.astrodao.com.core.dto.cli.AddProposalResponse;
import api.app.astrodao.com.core.dto.cli.CLIResponse;
import api.app.astrodao.com.core.dto.cli.dao.Config;
import api.app.astrodao.com.core.dto.cli.dao.NewDAODto;
import api.app.astrodao.com.core.utils.CLIUtils;
import api.app.astrodao.com.core.utils.JsonUtils;
import api.app.astrodao.com.core.utils.WaitUtils;
import io.qameta.allure.Step;

import java.time.Duration;
import java.util.List;

import static api.app.astrodao.com.core.Constants.CLICommands.*;
import static api.app.astrodao.com.core.utils.JsonUtils.writeValueAsString;
import static org.apache.commons.lang3.StringUtils.EMPTY;

@Steps
public class NearCLISteps {

    @Step("User waits '3' seconds for data to be aggregated")
    public void waitForAggregation() {
        WaitUtils.sleep(Duration.ofSeconds(4));
    }

    @Step("User calls 'view {accountId} get_config' in NEAR CLI")
    public Config getDaoConfig(String accountId) {
        String command = String.format(GET_DAO_CONFIG, accountId);
        List<String> output = CLIUtils.execute(command);
        output.removeIf(p -> p.contains("View call"));
        return JsonUtils.readValue(String.join(EMPTY, output), Config.class);
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
}
