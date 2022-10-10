package api.app.astrodao.com.tests.apiservice.proposals;

import api.app.astrodao.com.openapi.models.Proposal;
import api.app.astrodao.com.openapi.models.ProposalsResponse;
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

    @Value("${accounts.account1.accountId}")
    private String account1Id;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [limit, offset, orderBy, order]")
    @DisplayName("Get list of proposals with query param: [limit, offset, orderBy, order]")
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
    @Story("Get list of proposals with query param: [voted=false, accountId]")
    @DisplayName("Get list of proposals with query param: [voted=false, accountId]")
    void getListOfProposalsWithVotedFalseAndAccountIdParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "voted","false",
                "accountId", account1Id
        );

        ProposalResponse proposalResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalResponse.class);

        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), count, "total");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), page, "page");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "count");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);

        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
        proposalsApiSteps.assertCollectionHasExpectedSize(proposalResponse.getData(), ProposalDto::getTransactionHash, count, "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDescription() != null, "data/description");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes().keySet().stream().noneMatch(p -> p.equals(account1Id)), "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
    }

    @ParameterizedTest
    @CsvSource(value = {
            "sort; createdAt,DES; Invalid sort order. ASC,DESC expected",
            "limit; -50; LIMIT must not be negative",
            "offset; -5; OFFSET must not be negative",
            "page; -2; PAGE must not be negative",
            "s; query; Invalid search param. JSON expected",
            "fields; ids; id field is required",
            "fields; id; kind field is required",
            "fields; id,kind; createdAt field is required",
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
