package api.app.astrodao.com.tests;

import api.app.astrodao.com.openapi.models.Dao;
import api.app.astrodao.com.openapi.models.DaoResponse;
import api.app.astrodao.com.steps.DaoApiSteps;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import lombok.RequiredArgsConstructor;
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
    @Story("Getting a bounty by it's ID")
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
    @Story("Get list of DAOs with query param: [sort, fields]")
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
}
