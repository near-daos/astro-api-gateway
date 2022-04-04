package api.app.astrodao.com.tests.proposals;

import api.app.astrodao.com.core.dto.api.proposals.ProposalDto;
import api.app.astrodao.com.core.dto.api.proposals.ProposalResponse;
import api.app.astrodao.com.steps.ProposalsApiSteps;
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

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [sort, limit, offset]")
    @DisplayName("Get list of proposals with query param: [sort, limit, offset]")
    void getListOfProposalsWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;

        ProposalResponse proposalResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalResponse.class);

        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), limit, "total");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), page, "page");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), limit, "limit");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), limit);
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getTransactionHash().isBlank(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getType() != null, "data/type");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [sort, page]")
    @DisplayName("Get list of proposals with query param: [sort, page]")
    void getListOfProposalsWithSortAndPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );

        ProposalResponse proposalResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalResponse.class);

        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), count, "total");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), page, "page");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "limit");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getTransactionHash().isBlank(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getType() != null, "data/type");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");

        List<OffsetDateTime> createdAtList = proposalResponse.getData().stream().map(ProposalDto::getCreatedAt).collect(Collectors.toList());
        proposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Bounties should be sorted by createdAt in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [sort, s]")
    @DisplayName("Get list of proposals with query param: [sort, s]")
    void getListOfProposalsWithSortAndSParams() {
        int count = 50;
        int page = 1;
        String type = "Transfer";
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", String.format("{\"type\": \"%s\"}", type)
        );

        ProposalResponse proposalResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalResponse.class);

        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), count, "total");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), page, "page");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "limit");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getTransactionHash().isBlank(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getType().equals(type), "data/type");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");

        List<OffsetDateTime> createdAtList = proposalResponse.getData().stream().map(ProposalDto::getCreatedAt).collect(Collectors.toList());
        proposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Bounties should be sorted by createdAt in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of proposals with query param: [filter, or]")
    @DisplayName("Get list of proposals with query param: [filter, or]")
    void getListOfProposalsWithFilterAndOrParameters() {
        String type1 = "Transfer";
        String type2 = "AddBounty";
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "filter", "type||$eq||" + type1,
                "or", "type||$eq||" + type2
        );

        ProposalResponse proposalResponse = proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_OK)
                .extract().as(ProposalResponse.class);

        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getTotal().intValue(), count, "total");
        proposalsApiSteps.assertDtoValueGreaterThan(proposalResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getPage().intValue(), page, "page");
        proposalsApiSteps.assertDtoValue(proposalResponse, r -> r.getCount().intValue(), count, "limit");
        proposalsApiSteps.assertCollectionHasCorrectSize(proposalResponse.getData(), count);
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getTransactionHash().isBlank(), "data/transactionHash");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getId().contains(".sputnikv2.testnet-"), "data/id");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getProposalId() >= 0, "data/proposalId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDaoId().endsWith(".sputnikv2.testnet"), "data/daoId");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getProposer().isEmpty(), "data/proposer");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> !r.getDescription().isEmpty(), "data/description");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getStatus() != null, "data/status");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVoteStatus() != null, "data/voteStatus");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getKind() != null, "data/kind");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotes() != null, "data/votes");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getVotePeriodEnd() != null, "data/votePeriodEnd");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getDao() != null, "data/dao");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getActions() != null, "data/actions");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getCommentsCount() >= 0, "data/commentsCount");
        proposalsApiSteps.assertCollectionElementsHasValue(proposalResponse.getData(), r -> r.getPermissions() != null, "data/permissions");
        proposalsApiSteps.assertCollectionContainsExactlyInAnyOrder(proposalResponse.getData(), ProposalDto::getType, type1, type2);
    }

    @ParameterizedTest
    @CsvSource(value = {
            "sort; createdAt,DES; Invalid sort order. ASC,DESC expected",
            "limit; -50; LIMIT must not be negative",
            "offset; -5; OFFSET must not be negative",
//            "page; -2; PAGE must not be negative",
//            "fields; ids; PAGE must not be negative",
            "s; query; Invalid search param. JSON expected"
    }, delimiter = 59)
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get HTTP 400 status code for proposals")
    @DisplayName("Get HTTP 400 status code for proposals")
    void getHttp400StatusCodeForProposals(String key, String value, String errorMsg) {
        Map<String, Object> query = Map.of(key, value);

        proposalsApiSteps.getProposals(query).then()
                .statusCode(HTTP_BAD_REQUEST)
                .body("statusCode", equalTo(400),
                        "message", equalTo(errorMsg));
    }
}
