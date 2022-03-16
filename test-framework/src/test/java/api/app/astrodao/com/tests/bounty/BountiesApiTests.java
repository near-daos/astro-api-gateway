package api.app.astrodao.com.tests.bounty;

import api.app.astrodao.com.core.enums.HttpStatus;
import api.app.astrodao.com.openapi.models.BountyResponse;
import api.app.astrodao.com.steps.BountiesApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

@Tags({@Tag("all"), @Tag("bountiesApiTests")})
@Epic("Bounty")
@Feature("/bounties API tests")
@DisplayName("/bounties API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BountiesApiTests extends BaseTest {
    private final BountiesApiSteps bountiesApiSteps;

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
        Response response = bountiesApiSteps.getBounties(query);
        bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        BountyResponse bountyResponse = bountiesApiSteps.getResponseDto(response, BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), limit, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), limit, "limit");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), limit);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDaoId().isBlank(), "daoId");
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

        Response response = bountiesApiSteps.getBounties(query);
        bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        BountyResponse bountyResponse = bountiesApiSteps.getResponseDto(response, BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), count, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), count, "count");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), count);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getDaoId().isBlank(), "daoId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of bounties with query param: [sort, fields]")
    @DisplayName("Get list of bounties with query param: [sort, fields]")
    void getListOfBountiesWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","id,DESC",
                "fields", "id,numberOfClaims"
        );

        Response response = bountiesApiSteps.getBounties(query);
        bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        BountyResponse bountyResponse = bountiesApiSteps.getResponseDto(response, BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), count, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), count, "count");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), count);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getId().isBlank(), "id");
        //TODO: Add verifications for fields
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

        Response response = bountiesApiSteps.getBounties(query);
        bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        BountyResponse bountyResponse = bountiesApiSteps.getResponseDto(response, BountyResponse.class);

        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getTotal().intValue(), count, "total");
        bountiesApiSteps.assertDtoValueGreaterThan(bountyResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getPage().intValue(), page, "page");
        bountiesApiSteps.assertDtoValue(bountyResponse, r -> r.getCount().intValue(), count, "count");
        bountiesApiSteps.assertCollectionHasCorrectSize(bountyResponse.getData(), count);
        bountiesApiSteps.assertCollectionElementsHasValue(bountyResponse.getData(), r -> !r.getId().isBlank(), "id");
        //TODO: Add verifications for numberOfClaims
    }
}
