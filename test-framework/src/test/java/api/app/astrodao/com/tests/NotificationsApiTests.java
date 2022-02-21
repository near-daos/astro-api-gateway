package api.app.astrodao.com.tests;

import api.app.astrodao.com.core.dto.api.notigications.NotificationsResponse;
import api.app.astrodao.com.steps.NotificationsApiSteps;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tags({@Tag("all"), @Tag("notificationsApiTests")})
@Feature("NOTIFICATIONS API TESTS")
@DisplayName("NOTIFICATIONS API TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NotificationsApiTests extends BaseTest {
    private final NotificationsApiSteps notificationsApiSteps;

    @Value("${test.dao}")
    private String testDao;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, limit, offset]")
    void getListOfNotificationsWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = notificationsApiSteps.getNotifications(query);
        notificationsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NotificationsResponse notifications = notificationsApiSteps.getResponseDto(response, NotificationsResponse.class);

        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getTotal().intValue(), limit, "total");
        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getPageCount().intValue(), 1, "pageCount");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getPage().intValue(), page, "page");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getCount().intValue(), limit, "limit");
        notificationsApiSteps.assertCollectionHasCorrectSize(notifications.getData(), limit);
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getId() != null, "data/id");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getDao() != null, "data/dao");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getDaoId() != null, "data/daoId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getTargetId() != null, "data/targetId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getSignerId() != null, "data/signerId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getType() != null, "data/type");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getStatus() != null, "data/status");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getMetadata() != null, "data/metadata");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, limit, offset]")
    void getListOfNotificationsWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "page", page
        );
        ResponseEntity<String> response = notificationsApiSteps.getNotifications(query);
        notificationsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NotificationsResponse notifications = notificationsApiSteps.getResponseDto(response, NotificationsResponse.class);

        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getTotal().intValue(), count, "total");
        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getPageCount().intValue(), 1, "pageCount");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getPage().intValue(), page, "page");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getCount().intValue(), count, "limit");
        notificationsApiSteps.assertCollectionHasCorrectSize(notifications.getData(), count);
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getId() != null, "data/id");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getDao() != null, "data/dao");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getDaoId() != null, "data/daoId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getTargetId() != null, "data/targetId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getSignerId() != null, "data/signerId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getType() != null, "data/type");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getStatus() != null, "data/status");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getMetadata() != null, "data/metadata");
        //TODO: Add verification that sorting is done correctly
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, fields]")
    void getListOfNotificationsWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort", "id,DESC",
                "fields", "createdAt,id,metadata"
        );
        ResponseEntity<String> response = notificationsApiSteps.getNotifications(query);
        notificationsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NotificationsResponse notifications = notificationsApiSteps.getResponseDto(response, NotificationsResponse.class);

        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getTotal().intValue(), count, "total");
        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getPageCount().intValue(), 1, "pageCount");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getPage().intValue(), page, "page");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getCount().intValue(), count, "limit");
        notificationsApiSteps.assertCollectionHasCorrectSize(notifications.getData(), count);
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getCreatedAt() != null, "data/createdAt");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getId() != null, "data/id");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getMetadata() != null, "data/metadata");
        //TODO: Ask a question why we get dao field in response
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getDao() != null, "data/dao");

        notificationsApiSteps.assertCollectionElementsHasNoValue(notifications.getData(), r -> r.getDaoId() == null, "data/daoId");
        notificationsApiSteps.assertCollectionElementsHasNoValue(notifications.getData(), r -> r.getTargetId() == null, "data/targetId");
        notificationsApiSteps.assertCollectionElementsHasNoValue(notifications.getData(), r -> r.getSignerId() == null, "data/signerId");
        notificationsApiSteps.assertCollectionElementsHasNoValue(notifications.getData(), r -> r.getType() == null, "data/type");
        notificationsApiSteps.assertCollectionElementsHasNoValue(notifications.getData(), r -> r.getStatus() == null, "data/status");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, s]")
    void getListOfNotificationsWithsSortSParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"daoId\": \"%s\"}", testDao)
        );
        ResponseEntity<String> response = notificationsApiSteps.getNotifications(query);
        notificationsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        NotificationsResponse notifications = notificationsApiSteps.getResponseDto(response, NotificationsResponse.class);

        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getTotal().intValue(), count, "total");
        notificationsApiSteps.assertDtoValueGreaterThan(notifications, r -> r.getPageCount().intValue(), 1, "pageCount");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getPage().intValue(), page, "page");
        notificationsApiSteps.assertDtoValue(notifications, r -> r.getCount().intValue(), count, "limit");
        notificationsApiSteps.assertCollectionHasCorrectSize(notifications.getData(), count);
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getId() != null, "data/id");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getDao() != null, "data/dao");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getDaoId() != null, "data/daoId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getTargetId() != null, "data/targetId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getSignerId() != null, "data/signerId");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getType() != null, "data/type");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getStatus() != null, "data/status");
        notificationsApiSteps.assertCollectionElementsHasValue(notifications.getData(), r -> r.getMetadata() != null, "data/metadata");
    }
}
