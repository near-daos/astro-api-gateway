package api.app.astrodao.com.tests.notifications;

import api.app.astrodao.com.core.dto.api.notigications.Notification;
import api.app.astrodao.com.core.dto.api.notigications.NotificationsResponse;
import api.app.astrodao.com.steps.NotificationsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import api.app.astrodao.com.core.enums.HttpStatus;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tags({@Tag("all"), @Tag("notificationsApiTests")})
@Epic("Notifications")
@Feature("/notifications API tests")
@DisplayName("/notifications API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NotificationsApiTests extends BaseTest {
    private final NotificationsApiSteps notificationsApiSteps;

    @Value("${test.dao1}")
    private String testDao1;

    @Value("${test.dao2}")
    private String testDao2;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, limit, offset]")
    @DisplayName("User should be able to get list of notifications with query param: [sort, limit, offset]")
    void getListOfNotificationsWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        Response response = notificationsApiSteps.getNotifications(query);
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

        List<OffsetDateTime> createdAtList = notifications.getData().stream().map(Notification::getCreatedAt).collect(Collectors.toList());
        notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Notifications should be sorted by 'createdAt field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, page]")
    @DisplayName("User should be able to get list of notifications with query param: [sort, page]")
    void getListOfNotificationsWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "page", page
        );
        Response response = notificationsApiSteps.getNotifications(query);
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

        List<OffsetDateTime> createdAtList = notifications.getData().stream().map(Notification::getCreatedAt).collect(Collectors.toList());
        notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Notifications should be sorted by 'createdAt field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, fields]")
    @DisplayName("User should be able to get list of notifications with query param: [sort, fields]")
    void getListOfNotificationsWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort", "id,DESC",
                "fields", "createdAt,id,metadata"
        );
        Response response = notificationsApiSteps.getNotifications(query);
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

        List<String> ids = notifications.getData().stream().map(Notification::getId).collect(Collectors.toList());
        notificationsApiSteps.assertStringsAreSortedCorrectly(ids, Comparator.reverseOrder(),
                "Notifications should be sorted by ID in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [sort, s]")
    @DisplayName("User should be able to get list of notifications with query param: [sort, s]")
    void getListOfNotificationsWithSortAndSParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"daoId\": \"%s\"}", testDao1)
        );
        Response response = notificationsApiSteps.getNotifications(query);
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

        List<OffsetDateTime> createdAtList = notifications.getData().stream().map(Notification::getCreatedAt).collect(Collectors.toList());
        notificationsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Notifications should be sorted by 'createdAt field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of notifications with query param: [limit, filter, or]")
    @DisplayName("User should be able to get list of notifications with query param: [limit, filter, or]")
    void getListOfNotificationsWithFilterAndOrParameters() {
        int count = 1000;
        int page = 1;
        Map<String, Object> queryParams = Map.of(
                "limit", count,
                "filter", "daoId||$eq||" + testDao1,
                "or", "daoId||$eq||" + testDao2
        );

        Response response = notificationsApiSteps.getNotifications(queryParams);
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
        notificationsApiSteps.assertCollectionContainsExactlyInAnyOrder(notifications.getData(), Notification::getDaoId, testDao1, testDao2);
    }
}
