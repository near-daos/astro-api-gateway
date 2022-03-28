package api.app.astrodao.com.tests.dao;

import api.app.astrodao.com.openapi.models.DaoResponse;
import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("daoApiTests")})
@Epic("DAO")
@Feature("/dao API tests")
@DisplayName("/dao API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaoApiTests extends BaseTest {
    private final DaoApiSteps daoApiSteps;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of DAOs with query param: [sort, limit, offset]")
    @DisplayName("Get list of DAOs with query param: [sort, limit, offset]")
    void getListOfDaosWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;

        DaoResponse daoResponse = daoApiSteps.getDaos(query).then()
                .statusCode(HTTP_OK)
                .extract().as(DaoResponse.class);

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
    @DisplayName("Get list of DAOs with query param: [sort, page]")
    void getListOfDaosWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );

        DaoResponse daoResponse = daoApiSteps.getDaos(query).then()
                .statusCode(HTTP_OK)
                .extract().as(DaoResponse.class);

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
    @DisplayName("Get list of DAOs with query param: [sort, fields]")
    void getListOfDaosWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort","id,DESC",
                "fields", "id,numberOfMembers"
        );

        DaoResponse daoResponse = daoApiSteps.getDaos(query).then()
                .statusCode(HTTP_OK)
                .extract().as(DaoResponse.class);

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
    @DisplayName("Get list of DAOs with query param: [sort, s]")
    void getListOfDaosSortSParams() {
        int count = 50;
        int page = 1;
        int numberOfMembers = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "s", String.format("{\"numberOfMembers\": %s}", numberOfMembers)
        );

        DaoResponse daoResponse = daoApiSteps.getDaos(query).then()
                .statusCode(HTTP_OK)
                .extract().as(DaoResponse.class);

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
    @Story("Get HTTP 400 for DAOs")
    @DisplayName("Get HTTP 400 for DAOs")
    void getHttp400ForDaos() {
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "limit", 50,
                "offset", 0,
                "page", 1,
                "fields", "daoId,createdAt",
                "s", "Invalid search request");

        daoApiSteps.getDaos(query).then()
                .statusCode(HTTP_BAD_REQUEST)
                .body("statusCode", equalTo(400),
                      "message", equalTo("Invalid search param. JSON expected"),
                      "error", equalTo("Bad Request"));
    }

}
