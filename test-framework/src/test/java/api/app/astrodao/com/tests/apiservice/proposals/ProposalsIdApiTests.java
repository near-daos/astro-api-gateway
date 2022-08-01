package api.app.astrodao.com.tests.apiservice.proposals;

import api.app.astrodao.com.core.dto.api.proposals.ProposalDto;
import api.app.astrodao.com.openapi.models.Proposal;
import api.app.astrodao.com.steps.apiservice.ProposalsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("proposalsIdApiTests")})
@Epic("Proposals")
@Feature("/proposals/{id} API tests")
@DisplayName("/proposals/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ProposalsIdApiTests extends BaseTest {
    private final ProposalsApiSteps proposalsApiSteps;

    @Value("${test.approved.bounty.proposal1}")
    private String testProposal1;

    @Value("${accounts.account1.accountId}")
    private String accountIdWithPermissions;

    @Value("${accounts.account2.accountId}")
    private String accountIdWithoutPermissions;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting proposal by ID without 'accountId' query param")
    @DisplayName("Getting proposal by ID without 'accountId' query param")
    void getProposalByID() {
        Integer proposalId = Integer.valueOf(testProposal1.split("sputnikv2.testnet-")[1]);
        String daoId = testProposal1.split("sputnikv2.testnet-")[0];

        ProposalDto proposal = proposalsApiSteps.getProposalByID(testProposal1).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getIsArchived, "isArchived");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getCreatedAt, "createdAt");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdatedAt, "updatedAt");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getTransactionHash, "transactionHash");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdateTransactionHash, "updateTransactionHash");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getCreateTimestamp, "createTimestamp");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdateTimestamp, "updateTimestamp");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getId, testProposal1, "id");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getProposalId, proposalId, "proposalId");
        proposalsApiSteps.assertDtoHasValue(proposal, p -> p.getDaoId().startsWith(daoId), "daoId");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getProposer, accountIdWithPermissions, "proposer");
        proposalsApiSteps.assertDtoHasValue(proposal, r -> !r.getDescription().isEmpty(), "description");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getStatus, Proposal.StatusEnum.APPROVED, "status");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVoteStatus, "voteStatus");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getKind, "kind");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getPolicyLabel, "add_bounty", "policyLabel");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getType, "type");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getSubmissionTime, "submissionTime");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVotes, "votes");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVoteCounts, "voteCounts");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVotePeriodEnd, "votePeriodEnd");
        proposalsApiSteps.assertDtoValueIsNull(proposal, ProposalDto::getBountyDoneId, "bountyDoneId");
        proposalsApiSteps.assertDtoValueIsNull(proposal, ProposalDto::getBountyClaimId, "bountyClaimId");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getDao, "dao");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getActions, "actions");
        proposalsApiSteps.assertDtoHasValue(proposal, r -> r.getCommentsCount() >= 0, "commentsCount");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getIsCouncil(), Boolean.FALSE, "permissions/isCouncil");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanApprove(), Boolean.FALSE, "permissions/canApprove");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanReject(), Boolean.FALSE, "permissions/canReject");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanDelete(), Boolean.FALSE, "permissions/canDelete");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting proposal by ID with 'accountId' query param (for account with permissions)")
    @DisplayName("Getting proposal by ID with 'accountId' query param (for account with permissions)")
    void getProposalByIdWithAccountWithPermissions() {
        Integer proposalId = Integer.valueOf(testProposal1.split("sputnikv2.testnet-")[1]);
        String daoId = testProposal1.split("sputnikv2.testnet-")[0];

        ProposalDto proposal = proposalsApiSteps.getProposalByID(testProposal1, accountIdWithPermissions).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getIsArchived, "isArchived");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getCreatedAt, "createdAt");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdatedAt, "updatedAt");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getTransactionHash, "transactionHash");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdateTransactionHash, "updateTransactionHash");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getCreateTimestamp, "createTimestamp");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdateTimestamp, "updateTimestamp");        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getId, testProposal1, "id");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getProposalId, proposalId, "proposalId");
        proposalsApiSteps.assertDtoHasValue(proposal, p -> p.getDaoId().startsWith(daoId), "daoId");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getProposer, accountIdWithPermissions, "proposer");
        proposalsApiSteps.assertDtoHasValue(proposal, r -> !r.getDescription().isEmpty(), "description");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getStatus, Proposal.StatusEnum.APPROVED, "status");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVoteStatus, "voteStatus");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getKind, "kind");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getPolicyLabel, "add_bounty", "policyLabel");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getType, "type");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getSubmissionTime, "submissionTime");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVotes, "votes");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVoteCounts, "voteCounts");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVotePeriodEnd, "votePeriodEnd");
        proposalsApiSteps.assertDtoValueIsNull(proposal, ProposalDto::getBountyDoneId, "bountyDoneId");
        proposalsApiSteps.assertDtoValueIsNull(proposal, ProposalDto::getBountyClaimId, "bountyClaimId");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getDao, "dao");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getActions, "actions");
        proposalsApiSteps.assertDtoHasValue(proposal, r -> r.getCommentsCount() >= 0, "commentsCount");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getIsCouncil(), Boolean.TRUE, "permissions/isCouncil");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanApprove(), Boolean.TRUE, "permissions/canApprove");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanReject(), Boolean.TRUE, "permissions/canReject");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanDelete(), Boolean.TRUE, "permissions/canDelete");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting proposal by ID with 'accountId' query param (for account without permissions)")
    @DisplayName("Getting proposal by ID with 'accountId' query param (for account without permissions)")
    void getProposalByIdWithAccountWithoutPermissions() {
        Integer proposalId = Integer.valueOf(testProposal1.split("sputnikv2.testnet-")[1]);
        String daoId = testProposal1.split("sputnikv2.testnet-")[0];

        ProposalDto proposal = proposalsApiSteps.getProposalByID(testProposal1, accountIdWithoutPermissions).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalDto.class);

        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getIsArchived, "isArchived");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getCreatedAt, "createdAt");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdatedAt, "updatedAt");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getTransactionHash, "transactionHash");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdateTransactionHash, "updateTransactionHash");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getCreateTimestamp, "createTimestamp");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getUpdateTimestamp, "updateTimestamp");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getId, testProposal1, "id");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getProposalId, proposalId, "proposalId");
        proposalsApiSteps.assertDtoHasValue(proposal, p -> p.getDaoId().startsWith(daoId), "daoId");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getProposer, accountIdWithPermissions, "proposer");
        proposalsApiSteps.assertDtoHasValue(proposal, r -> !r.getDescription().isEmpty(), "description");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getStatus, Proposal.StatusEnum.APPROVED, "status");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVoteStatus, "voteStatus");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getKind, "kind");
        proposalsApiSteps.assertDtoValue(proposal, ProposalDto::getPolicyLabel, "add_bounty", "policyLabel");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getType, "type");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getSubmissionTime, "submissionTime");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVotes, "votes");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVoteCounts, "voteCounts");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getVotePeriodEnd, "votePeriodEnd");
        proposalsApiSteps.assertDtoValueIsNull(proposal, ProposalDto::getBountyDoneId, "bountyDoneId");
        proposalsApiSteps.assertDtoValueIsNull(proposal, ProposalDto::getBountyClaimId, "bountyClaimId");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getDao, "dao");
        proposalsApiSteps.assertDtoHasValue(proposal, ProposalDto::getActions, "actions");
        proposalsApiSteps.assertDtoHasValue(proposal, r -> r.getCommentsCount() >= 0, "commentsCount");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getIsCouncil(), Boolean.FALSE, "permissions/isCouncil");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanApprove(), Boolean.FALSE, "permissions/canApprove");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanReject(), Boolean.FALSE, "permissions/canReject");
        proposalsApiSteps.assertDtoValue(proposal, r -> r.getPermissions().getCanDelete(), Boolean.FALSE, "permissions/canDelete");
    }

    @ParameterizedTest
    @CsvSource(value = {
            "133; Invalid Proposal ID",
            "hfhgghfssd; Invalid Proposal ID",
            "testdao2.testnet; Invalid Proposal ID",
            "test-dao-1641395769436.sputnikv2.testnet; Invalid Proposal ID",
            "test-dao-1641395769436.sputnikv2.testnet-; Invalid Proposal ID",
    }, delimiter = 59)
    @Severity(SeverityLevel.NORMAL)
    @Story("Get HTTP 400 status code for invalid proposal ID")
    @DisplayName("Get HTTP 400 status code for invalid proposal ID")
    void getHttp400StatusCodeForInvalidProposalId(String proposal, String errorMsg) {

        proposalsApiSteps.getProposalByID(proposal).then()
                .statusCode(HTTP_BAD_REQUEST)
                .body("statusCode", equalTo(HTTP_BAD_REQUEST),
                        "message", equalTo(errorMsg));
    }
}
