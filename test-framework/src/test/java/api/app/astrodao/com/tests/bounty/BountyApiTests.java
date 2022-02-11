package api.app.astrodao.com.tests.bounty;

import api.app.astrodao.com.openapi.models.Bounty;
import api.app.astrodao.com.openapi.models.BountyResponse;
import api.app.astrodao.com.steps.BountiesApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tags({@Tag("all"), @Tag("bountyApiTests")})
@Feature("BOUNTY API TESTS")
@DisplayName("BOUNTY API TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class BountyApiTests extends BaseTest {
    private final BountiesApiSteps bountiesApiSteps;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting a bounty by it's ID")
    void getBountyById() {
        String daoId = "autotest-dao-1.sputnikv2.testnet";
        Integer bountyId = 1;
        String fullBountyId = String.format("%s-%s", daoId, bountyId);
        ResponseEntity<String> response = bountiesApiSteps.getBountyByID(fullBountyId);
        bountiesApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        Bounty bountyResponse = bountiesApiSteps.getResponseDto(response, Bounty.class);

        bountiesApiSteps.assertDtoValue(bountyResponse, Bounty::getDaoId, daoId, "daoId");
        bountiesApiSteps.assertDtoValue(bountyResponse, p -> p.getBountyId().intValue(), bountyId, "bountyId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of bounties with query param: [sort, limit, offset]")
    void getListOfBountiesWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = bountiesApiSteps.getBounties(query);
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
    void getListOfBountiesWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );

        ResponseEntity<String> response = bountiesApiSteps.getBounties(query);
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
    void getListOfBountiesWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","id,DESC",
                "fields", "id,numberOfClaims"
        );

        ResponseEntity<String> response = bountiesApiSteps.getBounties(query);
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
    void getListOfBountiesWithSortSParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", "{\"numberOfClaims\": 0}"
        );

        ResponseEntity<String> response = bountiesApiSteps.getBounties(query);
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
