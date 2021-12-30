package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.dao.DaoFeedResponse;
import api.app.astrodao.com.openapi.models.Dao;
import api.app.astrodao.com.openapi.models.DaoFeed;
import api.app.astrodao.com.openapi.models.DaoResponse;
import api.app.astrodao.com.steps.DaoApiSteps;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tags({@Tag("all"), @Tag("daoApiTests")})
@Feature("DAO API TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaoApiTests extends BaseTest {
    private final DaoApiSteps daoApiSteps;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting a feed for DAO by it's ID")
    void getFeedForDaoById() {
        String daoId = "autotest-dao-1.sputnikv2.testnet";

        ResponseEntity<String> response = daoApiSteps.getDaoFeed(daoId);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoFeed dao = daoApiSteps.getResponseDto(response, DaoFeed.class);

        daoApiSteps.assertDtoValue(dao, DaoFeed::getId, daoId, "id");
        daoApiSteps.assertDtoValueGreaterThan(dao, DaoFeed::getTotalDaoFunds, "10", "totalSupply");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Getting a DAO by it's ID")
    void getDaoById() {
        String daoId = "autotest-dao-1.sputnikv2.testnet";

        ResponseEntity<String> response = daoApiSteps.getDAOByID(daoId);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        Dao dao = daoApiSteps.getResponseDto(response, Dao.class);

        daoApiSteps.assertDtoValue(dao, Dao::getId, daoId, "id");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of DAOs with query param: [sort, limit, offset]")
    void getListOfDaosWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = daoApiSteps.getDaos(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoResponse daoResponse = daoApiSteps.getResponseDto(response, DaoResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getTotal().intValue(), limit, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getCount().intValue(), limit, "limit");
        daoApiSteps.assertCollectionHasCorrectSize(daoResponse.getData(), limit);
        daoApiSteps.assertCollectionElementsHasValue(daoResponse.getData(), r -> !r.getId().isBlank(), "id");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of DAOs with query param: [sort, page]")
    void getListOfDaosWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );
        ResponseEntity<String> response = daoApiSteps.getDaos(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoResponse daoResponse = daoApiSteps.getResponseDto(response, DaoResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getTotal().intValue(), count, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getCount().intValue(), count, "limit");
        daoApiSteps.assertCollectionHasCorrectSize(daoResponse.getData(), count);
        daoApiSteps.assertCollectionElementsHasValue(daoResponse.getData(), r -> !r.getId().isBlank(), "id");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of DAOs with query param: [sort, fields]")
    void getListOfDaosWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","id,DESC",
                "fields", "id,numberOfMembers"
        );
        ResponseEntity<String> response = daoApiSteps.getDaos(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoResponse daoResponse = daoApiSteps.getResponseDto(response, DaoResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getTotal().intValue(), count, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getCount().intValue(), count, "count");
        daoApiSteps.assertCollectionHasCorrectSize(daoResponse.getData(), count);
        daoApiSteps.assertCollectionElementsHasValue(daoResponse.getData(), r -> !r.getId().isBlank(), "id");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of DAOs with query param: [sort, s]")
    void getListOfDaosSortSParams() {
        int count = 50;
        int page = 1;
        int numberOfMembers = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", String.format("{\"numberOfMembers\": %s}", numberOfMembers)
        );

        ResponseEntity<String> response = daoApiSteps.getDaos(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoResponse daoResponse = daoApiSteps.getResponseDto(response, DaoResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getTotal().intValue(), count, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoResponse, r -> r.getCount().intValue(), count, "count");
        daoApiSteps.assertCollectionHasCorrectSize(daoResponse.getData(), count);
        daoApiSteps.assertCollectionElementsHasValue(daoResponse.getData(), r -> !r.getId().isBlank(), "id");
        daoApiSteps.assertCollectionElementsHasValue(daoResponse.getData(), r -> r.getNumberOfMembers().intValue() == numberOfMembers, "id");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get DAOs feed with query param: [sort, limit, offset]")
    void getDaosFeedWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = daoApiSteps.getDaosFeed(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoFeedResponse daoFeedResponse = daoApiSteps.getResponseDto(response, DaoFeedResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getTotal().intValue(), limit, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getCount().intValue(), limit, "limit");
        daoApiSteps.assertCollectionHasCorrectSize(daoFeedResponse.getData(), limit);
        daoApiSteps.assertCollectionElementsHasValue(daoFeedResponse.getData(), r -> !r.getId().isBlank(), "id");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get DAOs feed with query param: [sort, page]")
    void getDaosFeedWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );
        ResponseEntity<String> response = daoApiSteps.getDaosFeed(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoFeedResponse daoFeedResponse = daoApiSteps.getResponseDto(response, DaoFeedResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getTotal().intValue(), count, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getCount().intValue(), count, "limit");
        daoApiSteps.assertCollectionHasCorrectSize(daoFeedResponse.getData(), count);
        daoApiSteps.assertCollectionElementsHasValue(daoFeedResponse.getData(), r -> !r.getId().isBlank(), "id");
    }

    @Test
    @Disabled("Getting 500 status code")
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get DAOs feed with query param: [sort, fields]")
    void getDaosFeedWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","totalDaoFunds,DESC",
                "fields", "id,totalDaoFunds"
        );
        ResponseEntity<String> response = daoApiSteps.getDaosFeed(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoFeedResponse daoFeedResponse = daoApiSteps.getResponseDto(response, DaoFeedResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getTotal().intValue(), count, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getCount().intValue(), count, "count");
        daoApiSteps.assertCollectionHasCorrectSize(daoFeedResponse.getData(), count);
        daoApiSteps.assertCollectionElementsHasValue(daoFeedResponse.getData(), r -> !r.getId().isBlank(), "id");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get DAOs feed with query param: [sort, s]")
    void getDaosFeedWithSortSParams() {
        int count = 50;
        int page = 1;
        int numberOfMembers = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", String.format("{\"numberOfMembers\": %s}", numberOfMembers)
        );

        ResponseEntity<String> response = daoApiSteps.getDaosFeed(query);
        daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        DaoFeedResponse daoFeedResponse = daoApiSteps.getResponseDto(response, DaoFeedResponse.class);

        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getTotal().intValue(), count, "total");
        daoApiSteps.assertDtoValueGreaterThan(daoFeedResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getPage().intValue(), page, "page");
        daoApiSteps.assertDtoValue(daoFeedResponse, r -> r.getCount().intValue(), count, "count");
        daoApiSteps.assertCollectionHasCorrectSize(daoFeedResponse.getData(), count);
        daoApiSteps.assertCollectionElementsHasValue(daoFeedResponse.getData(), r -> !r.getId().isBlank(), "id");
        daoApiSteps.assertCollectionElementsHasValue(daoFeedResponse.getData(), r -> r.getNumberOfMembers().intValue() == numberOfMembers, "id");
    }
}
