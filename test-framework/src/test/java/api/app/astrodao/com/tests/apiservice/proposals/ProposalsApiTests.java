package api.app.astrodao.com.tests.apiservice.proposals;

import api.app.astrodao.com.openapi.models.Proposal;
import api.app.astrodao.com.openapi.models.ProposalsResponse;
import api.app.astrodao.com.openapi.models.VotePolicy;
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

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("proposalsApiTests")})
@Epic("Proposals")
@Feature("/proposals API tests")
@DisplayName("/proposals API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ProposalsApiTests extends BaseTest {
    private final ProposalsApiSteps proposalsApiSteps;

    @Value("${test.dao1}")
    private String testDao;

    @Value("${accounts.account1.accountId}")
    private String accountId;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [limit, offset, orderBy, order=DESC]")
    @DisplayName("Get list of proposals with query param: [limit, offset, orderBy, order=DESC]")
    void getListOfProposalsWithLimitOffsetOrderByOrderParams() {
        int limit = 10;

        Map<String, Object> query = Map.of(
                "limit", limit,
                "offset", 10,
                "orderBy","createdAt",
                "order","DESC"
                );

        ProposalsResponse proposalsResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalsResponse.class);

        proposalsApiSteps.assertDtoValueGreaterThan(proposalsResponse, r -> r.getTotal().intValue(), limit, "total");
        proposalsApiSteps.assertDtoValue(proposalsResponse, r -> r.getOffset().intValue(), limit, "offset");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalsResponse, r -> r.getTotal().intValue(), 28225, "total");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalsResponse.getData(), limit);

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getCreatedAt().toString().isEmpty(), "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getUpdatedAt().toString().isEmpty(), "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getTransactionHash().isEmpty(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getProposalId().intValue() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getStatus().toString().isEmpty(), "data/status");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getVoteStatus().toString().isEmpty(), "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getKind() != null, "data/kind");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getType().toString().isEmpty(), "data/type");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getVotePeriodEnd().toString().isEmpty(), "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getCommentsCount().intValue() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getActions() != null, "data/actions");

        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getId().isEmpty(), "data/actions/id", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getProposalId().isEmpty(), "data/actions/proposalId", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getAccountId().isEmpty(), "data/actions/accountId", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getAction() != null, "data/actions/action", "!= null");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTransactionHash().isEmpty(), "data/actions/transactionHash", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTimestamp().toString().isEmpty(), "data/actions/timestamp", "not empty");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getTransactionHash().isEmpty(), "data/dao/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getId().isEmpty(), "data/dao/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getConfig().getName().isEmpty(), "data/dao/config/name");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getConfig().getPurpose() != null, "data/dao/config/purpose");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getConfig().getMetadata().isEmpty(), "data/dao/config/metadata");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getNumberOfMembers().intValue() >= 1, "data/dao/numberOfMembers");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDaoId().isEmpty(), "data/dao/policy/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getWeightKind().toString().isEmpty(), "data/dao/policy/defaultVotePolicy/weightKind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getQuorum().intValue() >= 0, "data/dao/policy/defaultVotePolicy/quorum");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getKind().toString().isEmpty(), "data/dao/policy/defaultVotePolicy/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getRatio().isEmpty(), "data/dao/policy/defaultVotePolicy/ratio");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getIsCouncil().toString().isEmpty(), "data/permissions/isCouncil");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanApprove().toString().isEmpty(), "data/permissions/canApprove");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanReject().toString().isEmpty(), "data/permissions/canReject");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanDelete().toString().isEmpty(), "data/permissions/canDelete");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanAdd().toString().isEmpty(), "data/permissions/canAdd");
        
        List<OffsetDateTime> createdAtList = proposalsResponse.getData().stream().map(Proposal::getCreatedAt).collect(Collectors.toList());
        proposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                                                                  "Proposals should be sorted by 'createdAt' field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [dao, status, type, proposer]")
    @DisplayName("Get list of proposals with query param: [dao, status, type, proposer]")
    void getListOfProposalsWithQueryParamsDaoStatusTypeProposerFailed() {
        Map<String, Object> query = Map.of(
                "dao", testDao,
                "status", "InProgress",
                "type", "AddBounty",
                "proposer", accountId
        );

        ProposalsResponse proposalsResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalsResponse.class);

        proposalsApiSteps.assertDtoValue(proposalsResponse, r -> r.getLimit().intValue(), 50, "limit");
        proposalsApiSteps.assertDtoValue(proposalsResponse, r -> r.getOffset().intValue(), 0, "offset");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalsResponse, r -> r.getTotal().intValue(), 496, "total");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalsResponse.getData(), 50);

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getCreatedAt().toString().isEmpty(), "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getUpdatedAt().toString().isEmpty(), "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getTransactionHash().isEmpty(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getId().contains(testDao), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getProposalId().intValue() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getDaoId, testDao, "data/daoId");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getProposer, accountId, "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getStatus, Proposal.StatusEnum.INPROGRESS, "data/status");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getVoteStatus, Proposal.VoteStatusEnum.EXPIRED, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getKind() != null, "data/kind");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getType, Proposal.TypeEnum.ADDBOUNTY, "data/type");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getVotePeriodEnd().toString().isEmpty(), "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getCommentsCount().intValue() >= 0, "data/commentsCount");

        proposalsApiSteps.assertDeepCollectionElementsHasValue(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getId().isEmpty(), "data/actions/id", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsHasValue(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getProposalId().contains(testDao), "data/actions/proposalId", "contains " + testDao);
        proposalsApiSteps.assertDeepCollectionElementsHasValue(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getAccountId().equals(accountId), "data/actions/accountId", "eqauals " + accountId);
        proposalsApiSteps.assertDeepCollectionElementsHasValue(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getAction() != null, "data/actions/action", "!= null");
        proposalsApiSteps.assertDeepCollectionElementsHasValue(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTransactionHash().isEmpty(), "data/actions/transactionHash", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsHasValue(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTimestamp().toString().isEmpty(), "data/actions/timestamp", "not empty");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getTransactionHash().isEmpty(), "data/dao/transactionHash");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getId(), testDao, "data/dao/id");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getConfig().getName(), "test-dao-1641395769436", "data/dao/config/name");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getConfig().getPurpose() != null, "data/dao/config/purpose");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getConfig().getMetadata().isEmpty(), "data/dao/config/metadata");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getNumberOfMembers().intValue() >= 1, "data/dao/numberOfMembers");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDaoId(), testDao, "data/dao/policy/daoId");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getWeightKind(), VotePolicy.WeightKindEnum.ROLEWEIGHT, "data/dao/policy/defaultVotePolicy/weightKind");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getQuorum().intValue(), 0, "data/dao/policy/defaultVotePolicy/quorum");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getKind(), VotePolicy.KindEnum.RATIO, "data/dao/policy/defaultVotePolicy/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getRatio().isEmpty(), "data/dao/policy/defaultVotePolicy/ratio");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getIsCouncil().toString().isEmpty(), "data/permissions/isCouncil");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanApprove().toString().isEmpty(), "data/permissions/canApprove");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanReject().toString().isEmpty(), "data/permissions/canReject");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanDelete().toString().isEmpty(), "data/permissions/canDelete");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), proposal -> !proposal.getPermissions().getCanAdd().toString().isEmpty(), "data/permissions/canAdd");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [search, accountId, voted=true]")
    @DisplayName("Get list of proposals with query param: [accountId, voted=true]")
    void getListOfProposalsWithQueryParamsAccountIdVoted() {
        String searchString = "Poll created with NEAR CLI";
        Map<String, Object> query = Map.of(
                "search", searchString,
                "accountId", accountId,
                "voted", true
        );

        ProposalsResponse proposalsResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalsResponse.class);


        proposalsApiSteps.assertDtoValueGreaterThan(proposalsResponse, r -> r.getTotal().intValue(), 50, "total");
        proposalsApiSteps.assertDtoValue(proposalsResponse, r -> r.getOffset().intValue(), 0, "offset");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalsResponse, r -> r.getTotal().intValue(), 1169, "total");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalsResponse.getData(), 50);

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getCreatedAt().toString().isEmpty(), "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getUpdatedAt().toString().isEmpty(), "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getTransactionHash().isEmpty(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getId().contains(testDao), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getProposalId().intValue() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getDaoId, testDao, "data/daoId");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getProposer, accountId, "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDescription().contains(searchString), "data/description");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getStatus().toString().isEmpty(), "data/status");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getVoteStatus, Proposal.VoteStatusEnum.ACTIVE, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getKind() != null, "data/kind");

        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getType, Proposal.TypeEnum.VOTE, "data/type");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getVotePeriodEnd().toString().isEmpty(), "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getCommentsCount().intValue() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getActions() != null, "data/actions");

        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getId().startsWith(testDao), "data/actions/id", "starts with " + testDao);
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getProposalId().startsWith(testDao), "data/actions/proposalId", "starts with " + testDao);
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getAccountId().equals(accountId), "data/actions/accountId", "eqauals " + accountId);
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getAction() != null, "data/actions/action", "!= null");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTransactionHash().isEmpty(), "data/actions/transactionHash", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTimestamp().toString().isEmpty(), "data/actions/timestamp", "not empty");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getTransactionHash().isEmpty(), "data/dao/transactionHash");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getId(), testDao, "data/dao/id");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getConfig().getName(), "test-dao-1641395769436", "data/dao/config/name");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getConfig().getPurpose().isEmpty(), "data/dao/config/purpose");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getConfig().getMetadata().isEmpty(), "data/dao/config/metadata");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getNumberOfMembers().intValue() >= 1, "data/dao/numberOfMembers");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDaoId(), testDao, "data/dao/policy/daoId");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getWeightKind(), VotePolicy.WeightKindEnum.ROLEWEIGHT, "data/dao/policy/defaultVotePolicy/weightKind");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getQuorum().intValue(), 0, "data/dao/policy/defaultVotePolicy/quorum");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getKind(), VotePolicy.KindEnum.RATIO, "data/dao/policy/defaultVotePolicy/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getRatio().isEmpty(), "data/dao/policy/defaultVotePolicy/ratio");

        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getIsCouncil(), Boolean.TRUE, "data/permissions/isCouncil");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanApprove(), Boolean.TRUE, "data/permissions/canApprove");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanReject(), Boolean.TRUE, "data/permissions/canReject");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanDelete(), Boolean.TRUE, "data/permissions/canDelete");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanAdd(), Boolean.TRUE, "data/permissions/canAdd");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [limit, orderBy, order=ASC, active=true]")
    @DisplayName("Get list of proposals with query param: [limit, orderBy, order=ASC, active=true]")
    void getListOfProposalsWithQueryParamsLimitOrderByOrderActive() {
        int limit = 10;
        Map<String, Object> query = Map.of(
                "limit", limit,
                "orderBy", "id",
                "order", "ASC",
                "active", true
        );

        ProposalsResponse proposalsResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalsResponse.class);


        proposalsApiSteps.assertDtoValueGreaterThan(proposalsResponse, r -> r.getTotal().intValue(), limit, "total");
        proposalsApiSteps.assertDtoValue(proposalsResponse, r -> r.getOffset().intValue(), 0, "offset");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalsResponse, r -> r.getTotal().intValue(), 185, "total");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalsResponse.getData(), limit);

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getCreatedAt().toString().isEmpty(), "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getUpdatedAt().toString().isEmpty(), "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getTransactionHash().isEmpty(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getProposalId().intValue() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getStatus, Proposal.StatusEnum.INPROGRESS, "data/status");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), Proposal::getVoteStatus, Proposal.VoteStatusEnum.ACTIVE, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getKind() != null, "data/kind");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getType().toString().isEmpty(), "data/type");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getVotePeriodEnd().toString().isEmpty(), "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getCommentsCount().intValue() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getActions() != null, "data/actions");
//
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getId().isEmpty(), "data/actions/id", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getProposalId().isEmpty(), "data/actions/proposalId", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getAccountId().isEmpty(), "data/actions/accountId", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> proposal.getAction() != null, "data/actions/action", "!= null");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTransactionHash().isEmpty(), "data/actions/transactionHash", "not empty");
        proposalsApiSteps.assertDeepCollectionElementsMatchCondition(proposalsResponse.getData(), Proposal::getActions, proposal -> !proposal.getTimestamp().toString().isEmpty(), "data/actions/timestamp", "not empty");

        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getTransactionHash().isEmpty(), "data/dao/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getId().isEmpty(), "data/dao/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getConfig().getName().isEmpty(), "data/dao/config/name");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getConfig().getPurpose() != null, "data/dao/config/purpose");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getConfig().getMetadata().isEmpty(), "data/dao/config/metadata");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getNumberOfMembers().intValue() >= 1, "data/dao/numberOfMembers");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDaoId().isEmpty(), "data/dao/policy/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getWeightKind().toString().isEmpty(), "data/dao/policy/defaultVotePolicy/weightKind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> r.getDao().getPolicy().getDefaultVotePolicy().getQuorum().intValue() >= 0, "data/dao/policy/defaultVotePolicy/quorum");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getKind().toString().isEmpty(), "data/dao/policy/defaultVotePolicy/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalsResponse.getData(), r -> !r.getDao().getPolicy().getDefaultVotePolicy().getRatio().isEmpty(), "data/dao/policy/defaultVotePolicy/ratio");

        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getIsCouncil(), Boolean.FALSE, "data/permissions/isCouncil");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanApprove(), Boolean.FALSE, "data/permissions/canApprove");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanReject(), Boolean.FALSE, "data/permissions/canReject");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanDelete(), Boolean.FALSE, "data/permissions/canDelete");
        proposalsApiSteps.assertCollectionContainsOnly(proposalsResponse.getData(), proposal -> proposal.getPermissions().getCanAdd(), Boolean.FALSE, "data/permissions/canAdd");

        List<String> listOfIds = proposalsResponse.getData().stream().map(Proposal::getId).collect(Collectors.toList());
        proposalsApiSteps.assertStringsAreSortedCorrectly(listOfIds, Comparator.naturalOrder(),
                                                                  "Proposals should be sorted by 'id' field in ASC order");
    }

    @ParameterizedTest
    @CsvSource(value = {
            "limit; -50; LIMIT must not be negative",
            "offset; -5; OFFSET must not be negative"
    }, delimiter = 59)
    @Severity(SeverityLevel.NORMAL)
    @Story("Get HTTP 400 status code for proposals")
    @DisplayName("Get HTTP 400 status code for proposals")
    void getHttp400StatusCodeForProposals(String key, String value, String errorMsg) {
        Map<String, Object> query = Map.of(key, value);

        proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_BAD_REQUEST)
                .body("statusCode", equalTo(HTTP_BAD_REQUEST),
                        "message", equalTo(errorMsg));
    }
}
