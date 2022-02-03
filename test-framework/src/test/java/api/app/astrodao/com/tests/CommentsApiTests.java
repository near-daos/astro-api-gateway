package api.app.astrodao.com.tests;

import api.app.astrodao.com.openapi.models.CommentResponse;
import api.app.astrodao.com.steps.CommentsApiSteps;
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

@Tags({@Tag("all"), @Tag("commentsApiTests")})
@Feature("COMMENTS API TESTS")
@DisplayName("COMMENTS API TESTS")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class CommentsApiTests extends BaseTest {
    private final CommentsApiSteps commentsApiSteps;

    @Value("${test.dao}")
    private String testDao;

    @Value("${test.proposal}")
    private String testProposal;

    @Value("${accounts.account1.accountId}")
    private String accountId;

    @Value("${accounts.account1.publicKey}")
    private String accountPublicKey;

    @Value("${accounts.account1.signature}")
    private String accountSignature;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of comments with query param: [sort, limit, offset]")
    void getListOfCommentsWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;
        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), limit, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), limit, "limit");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), limit);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of comments with query param: [sort, limit, offset]")
    void getListOfCommentsWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort","createdAt,DESC",
                "page", page
        );
        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "limit");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of comments with query param: [sort, fields]")
    void getListOfCommentsWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort", "id,DESC",
                "fields", "id,message"
        );
        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> r.getId().longValue() > 0, "id");
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getDaoId() == null, "daoId");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getProposalId() == null, "proposalId");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getContextId() == null, "contextId");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getContextType() == null, "contextType");
        //TODO: Ask a question comment with 229 ID has a report data
        //commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getReports().isEmpty(), "reports");
        commentsApiSteps.assertCollectionElementsValue(commentResponse.getData(), r -> r.getAccountId() == null, "accountId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of comments with query param: [sort, s]")
    void getListOfCommentsSortSParams() {
        int count = 50;
        int page = 1;
        String accountId = "anima.testnet";
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"accountId\": \"%s\"}", accountId)
        );

        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> r.getId().longValue() > 0, "id");
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> accountId.equals(r.getAccountId()), "accountId");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Get list of comments with query param: [sort, s]")
    void createNewCommentForProposal() {
        int count = 50;
        int page = 1;
        String accountId = "anima.testnet";
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"accountId\": \"%s\"}", accountId)
        );

        ResponseEntity<String> response = commentsApiSteps.getComments(query);
        commentsApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

        CommentResponse commentResponse = commentsApiSteps.getResponseDto(response, CommentResponse.class);
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> r.getId().longValue() > 0, "id");
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> accountId.equals(r.getAccountId()), "accountId");
    }
}
