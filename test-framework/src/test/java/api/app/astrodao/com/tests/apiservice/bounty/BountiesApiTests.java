package api.app.astrodao.com.tests.apiservice.bounty;

import api.app.astrodao.com.openapi.models.Bounty;
import api.app.astrodao.com.openapi.models.BountyResponse;
import api.app.astrodao.com.steps.apiservice.BountiesApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("bountiesApiTests")})
@Epic("Bounty")
@Feature("/bounties API tests")
@DisplayName("/bounties API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BountiesApiTests extends BaseTest {
    private final BountiesApiSteps bountiesApiSteps;

    @Value("${test.approved.bounty.proposal1}")
    private String testProposal1;

    @Value("${test.approved.bounty.proposal2}")
    private String testProposal2;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of bounties with query param: [sort, limit, offset]")
    @DisplayName("Get list of bounties with query param: [sort, limit, offset]")
    void getListOfBountiesWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;

        BountyResponse bountyResponse = bountiesApiSteps.getBounties(query).then()
                .statusCode(HTTP_OK)
                .extract().as(BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), limit, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), limit, "limit");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), limit);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDaoId().isBlank(), "daoId");

        List<OffsetDateTime> createdAtList = bountyResponse.getData().stream().map(Bounty::getCreatedAt).collect(Collectors.toList());
        bountiesApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Bounties should be sorted by createdAt in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of bounties with query param: [sort, page]")
    @DisplayName("Get list of bounties with query param: [sort, page]")
    void getListOfBountiesWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );

        BountyResponse bountyResponse = bountiesApiSteps.getBounties(query).then()
                .statusCode(HTTP_OK)
                .extract().as(BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), count, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), count, "count");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), count);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDaoId().isBlank(), "daoId");

        List<OffsetDateTime> createdAtList = bountyResponse.getData().stream().map(Bounty::getCreatedAt).collect(Collectors.toList());
        bountiesApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Bounties should be sorted by createdAt in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of bounties with query param: [sort, fields, s]")
    @DisplayName("Get list of bounties with query param: [sort, fields, s]")
    void getListOfBountiesWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","id,DESC",
                "fields", "id,numberOfClaims",
                "s", "{\"numberOfClaims\": 0}"
        );

        BountyResponse bountyResponse = bountiesApiSteps.getBounties(query).then()
                .statusCode(HTTP_OK)
                .extract().as(BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), count, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), count, "count");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), count);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getId().isBlank(), "data/id");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getNumberOfClaims().equals(BigDecimal.ZERO), "data/numberOfClaims");

        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getIsArchived() == null, "data/isArchived");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getCreatedAt() == null, "data/createdAt");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getUpdatedAt() == null, "data/updatedAt");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getTransactionHash() == null, "data/transactionHash");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getCreateTimestamp() == null, "data/createTimestamp");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getUpdateTimestamp() == null, "data/updateTimestamp");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getBountyId() == null, "data/bountyId");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getProposalId() == null, "data/proposalId");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getDaoId() == null, "data/daoId");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getDescription() == null, "data/description");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getToken() == null, "data/token");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getAmount() == null, "data/amount");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getTimes() == null, "data/times");
        bountiesApiSteps.assertCollectionElementsHasNoValue(bountyResponse.getData(), r -> r.getMaxDeadline() == null, "data/maxDeadline");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getDao() != null, "data/dao");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getBountyClaims() != null, "data/bountyClaims");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of bounties with query param: [sort, s]")
    @DisplayName("Get list of bounties with query param: [sort, s]")
    void getListOfBountiesWithSortSParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", "{\"numberOfClaims\": 0}"
        );

        BountyResponse bountyResponse = bountiesApiSteps.getBounties(query).then()
                .statusCode(HTTP_OK)
                .extract().as(BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), count, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), count, "count");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), count);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getNumberOfClaims().equals(BigDecimal.ZERO), "data/numberOfClaims");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getIsArchived() != null, "data/isArchived");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getId().isBlank(), "data/id");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getBountyId() != null, "data/id");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDaoId().isBlank(), "data/daoId");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDescription().isBlank(), "data/description");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getToken() != null, "data/token");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getAmount().isBlank(), "data/amount");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getTimes().isBlank(), "data/times");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getMaxDeadline().isBlank(), "data/maxDeadline");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getDao() != null, "data/dao");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getBountyClaims() != null, "data/bountyClaims");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [filter, or]")
    @DisplayName("User should be able to get list of notifications with query param: [filter, or]")
    void getListOfNotificationsWithFilterAndOrParameters() {
        int count = 2;
        int page = 1;
        Map<String, Object> query = Map.of(
                "filter", "proposalId||$eq||" + testProposal1,
                "or", "proposalId||$eq||" + testProposal2
        );

        BountyResponse bountyResponse = bountiesApiSteps.getBounties(query).then()
                .statusCode(HTTP_OK)
                .extract().as(BountyResponse.class);

        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getTotal().intValue(), count, "total");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), count, "count");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), count);
        bountiesApiSteps.assertCollectionContainsExactlyInAnyOrder(bountyResponse.getData(), Bounty::getProposalId, testProposal1, testProposal2);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getIsArchived() != null, "data/isArchived");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getUpdatedAt() != null, "data/updatedAt");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getTransactionHash().isBlank(), "data/transactionHash");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getCreateTimestamp() != null, "data/createTimestamp");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getUpdateTimestamp() != null, "data/updateTimestamp");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getId().isBlank(), "data/id");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getBountyId() != null, "data/id");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getProposalId().isBlank(), "data/proposalId");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDaoId().isBlank(), "data/daoId");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDescription().isBlank(), "data/description");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getToken() != null, "data/token");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getAmount().isBlank(), "data/amount");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getTimes().isBlank(), "data/times");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getMaxDeadline().isBlank(), "data/maxDeadline");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getNumberOfClaims() != null, "data/numberOfClaims");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getDao() != null, "data/dao");
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> r.getBountyClaims() != null, "data/bountyClaims");
    }

    @Test
    @Severity(SeverityLevel.NORMAL)
    @Story("User should be able to get list of notifications with invalid query param")
    @DisplayName("User should be able to get list of notifications with invalid query param")
    void getListOfNotificationsWithInvalidParameters() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", -10,
                "offset", 0
        );
        String errorMsg = "LIMIT must not be negative";

        String responseMsg = bountiesApiSteps.getBounties(query).then()
                .statusCode(HTTP_BAD_REQUEST)
                .extract().jsonPath().getString("message");

        bountiesApiSteps.assertStringContainsValue(responseMsg, errorMsg);
    }
}
