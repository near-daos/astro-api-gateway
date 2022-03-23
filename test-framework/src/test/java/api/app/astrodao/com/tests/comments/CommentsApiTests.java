package api.app.astrodao.com.tests.comments;

import api.app.astrodao.com.core.dto.api.comments.CreatedComment;
import api.app.astrodao.com.core.enums.HttpStatus;
import api.app.astrodao.com.core.utils.WaitUtils;
import api.app.astrodao.com.openapi.models.Comment;
import api.app.astrodao.com.openapi.models.CommentResponse;
import api.app.astrodao.com.steps.CommentsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import io.restassured.response.Response;
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

import static java.net.HttpURLConnection.*;

@Tags({@Tag("all"), @Tag("commentsApiTests")})
@Epic("Comments")
@Feature("/comments API tests")
@DisplayName("/comments API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class CommentsApiTests extends BaseTest {
    private final CommentsApiSteps commentsApiSteps;
    private final Faker faker;

    @Value("${test.dao1}")
    private String testDao;

    @Value("${test.proposal1}")
    private String testProposal;

    @Value("${test.bounty1}")
    private String testBounty;

    @Value("${accounts.account1.accountId}")
    private String account1Id;

    @Value("${accounts.account1.publicKey}")
    private String account1PublicKey;

    @Value("${accounts.account1.signature}")
    private String account1Signature;

    @Value("${accounts.account2.accountId}")
    private String account2Id;

    @Value("${accounts.account2.publicKey}")
    private String account2PublicKey;

    @Value("${accounts.account2.signature}")
    private String account2Signature;

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of comments with query param: [sort, limit, offset]")
    @DisplayName("User should be able to get list of comments with query param: [sort, limit, offset]")
    void getListOfCommentsWithSortLimitOffsetParams() {
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "limit", 10,
                "offset", 0
        );
        int limit = 10;
        int page = 1;

        CommentResponse commentResponse = commentsApiSteps.getComments(query).then()
                .statusCode(HTTP_OK)
                .extract().as(CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), limit, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), limit, "limit");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), limit);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");

        List<OffsetDateTime> createdAtList = commentResponse.getData().stream().map(Comment::getCreatedAt).collect(Collectors.toList());
        commentsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Comments should be sorted by 'createdAt field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of comments with query param: [sort, page]")
    @DisplayName("User should be able to get list of comments with query param: [sort, page]")
    void getListOfCommentsWithSortPageParams() {
        int count = 50;
        int page = 2;
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "page", page
        );

        CommentResponse commentResponse = commentsApiSteps.getComments(query).then()
                .statusCode(HTTP_OK)
                .extract().as(CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "limit");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> !r.getMessage().isBlank(), "message");

        List<OffsetDateTime> createdAtList = commentResponse.getData().stream().map(Comment::getCreatedAt).collect(Collectors.toList());
        commentsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Comments should be sorted by 'createdAt field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of comments with query param: [sort, fields]")
    @DisplayName("User should be able to get list of comments with query param: [sort, fields]")
    void getListOfCommentsWithSortFieldsParams() {
        int count = 50;
        int page = 1;
        Map<String, Object> query = Map.of(
                "sort", "id,DESC",
                "fields", "id,message"
        );

        CommentResponse commentResponse = commentsApiSteps.getComments(query).then()
                .statusCode(HTTP_OK)
                .extract().as(CommentResponse.class);

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

        List<BigDecimal> ids = commentResponse.getData().stream().map(Comment::getId).collect(Collectors.toList());
        commentsApiSteps.assertBigDecimalsAreSortedCorrectly(ids, Comparator.reverseOrder(),
                "Comments should be sorted by ID in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to get list of comments with query param: [sort, s]")
    @DisplayName("User should be able to get list of comments with query param: [sort, s]")
    void getListOfCommentsSortSParams() {
        int count = 50;
        int page = 1;
        String accountId = "anima.testnet";
        Map<String, Object> query = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"accountId\": \"%s\"}", accountId)
        );

        CommentResponse commentResponse = commentsApiSteps.getComments(query).then()
                .statusCode(HTTP_OK)
                .extract().as(CommentResponse.class);

        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getTotal().intValue(), count, "total");
        commentsApiSteps.assertDtoValueGreaterThan(commentResponse, r -> r.getPageCount().intValue(), page, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), page, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), count, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), count);
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> r.getId().longValue() > 0, "id");
        commentsApiSteps.assertCollectionElementsHasValue(commentResponse.getData(), r -> accountId.equals(r.getAccountId()), "accountId");

        List<OffsetDateTime> createdAtList = commentResponse.getData().stream().map(Comment::getCreatedAt).collect(Collectors.toList());
        commentsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
                "Comments should be sorted by 'createdAt field in DESC order");
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Creating new comment for a proposal")
    @DisplayName("Creating new comment for a proposal")
    void createNewCommentForProposal() {
        String contextType = "Proposal";
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Map<String, Object> queryToGetCreatedComment = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"message\": \"%s\"}", commentMsg)
        );

        CreatedComment createdComment = commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature,
                testProposal, contextType, commentMsg)
                .then()
                .statusCode(HTTP_CREATED)
                .extract().as(CreatedComment.class);

        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextId, testProposal, "contextId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextType, contextType, "contextType");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getMessage, commentMsg, "message");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getAccountId, account1Id, "accountId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getPublicKey, account1PublicKey, "publicKey");
        commentsApiSteps.assertDtoHasValue(createdComment, CreatedComment::getId, "id");

        CommentResponse commentResponse = commentsApiSteps.getComments(queryToGetCreatedComment).then()
                .statusCode(HTTP_OK)
                .extract().as(CommentResponse.class);

        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getTotal().intValue(), 1, "total");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), 1, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), 1, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), 1);
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getId, createdComment.getId(), "id");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getAccountId, account1Id, "accountId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getContextType, contextType, "contextType");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getContextId, testProposal, "contextId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getDaoId, testDao, "daoId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getMessage, commentMsg, "message");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData().get(0).getReports(), 0);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("Creating new comment for a bounty")
    @DisplayName("Creating new comment for a bounty")
    void createNewCommentForBounty() {
        String contextType = "BountyContext";
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Map<String, Object> queryToGetCreatedComment = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"message\": \"%s\"}", commentMsg)
        );

        CreatedComment createdComment = commentsApiSteps.createComment(
                        account1Id, account1PublicKey, account1Signature, testBounty,contextType, commentMsg)
                .then()
                .statusCode(HTTP_CREATED)
                .extract().as(CreatedComment.class);

        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextId, testBounty, "contextId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getContextType, contextType, "contextType");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getMessage, commentMsg, "message");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getAccountId, account1Id, "accountId");
        commentsApiSteps.assertDtoValue(createdComment, CreatedComment::getPublicKey, account1PublicKey, "publicKey");
        commentsApiSteps.assertDtoHasValue(createdComment, CreatedComment::getId, "id");

        CommentResponse commentResponse = commentsApiSteps.getComments(queryToGetCreatedComment).then()
                .statusCode(HTTP_OK)
                .extract().as(CommentResponse.class);

        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getTotal().intValue(), 1, "total");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), 1, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), 1, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), 1);
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getId, createdComment.getId(), "id");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getAccountId, account1Id, "accountId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getContextType, contextType, "contextType");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getContextId, testBounty, "contextId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getDaoId, testDao, "daoId");
        commentsApiSteps.assertDtoValue(commentResponse.getData().get(0), Comment::getMessage, commentMsg, "message");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData().get(0).getReports(), 0);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to create comment for a proposal (by using invalid public key)")
    @DisplayName("User should not be able to create comment for a proposal (by using invalid public key)")
    void createNewCommentForProposalWithInvalidPublicKey() {
        String contextType = "Proposal";
        String errorMsg = String.format("Account %s identity is invalid - public key", account1Id);
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Response newCommentResponse = commentsApiSteps.createComment(
                account1Id, account2PublicKey, account1Signature, testProposal, contextType, commentMsg
        );

        commentsApiSteps.assertResponseStatusCode(newCommentResponse, HttpStatus.FORBIDDEN);
        commentsApiSteps.assertStringContainsValue(newCommentResponse.body().asString(), errorMsg);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to create comment for non-existing proposal")
    @DisplayName("User should not be able to create comment for non-existing proposal")
    void createNewCommentForNonExistingProposal() {
        String contextType = "Proposal";
        String invalidContextId = "test-dao-1641395769436.sputnikv2.testnet-9111111";
        String errorMsg = String.format("Proposal with id %s not found", invalidContextId);
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        commentsApiSteps.createComment(
                account1Id, account1PublicKey, account1Signature, invalidContextId, contextType, commentMsg)
                .then()
                .statusCode(HTTP_NOT_FOUND)
                .extract().body().path("message", errorMsg);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should be able to delete existing comment for a proposal")
    @DisplayName("User should be able to delete existing comment for a proposal")
    void deleteExistingCommentForProposal() {
        String contextType = "Proposal";
        String reason = "Language";
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        Map<String, Object> queryToGetCreatedComment = Map.of(
                "sort", "createdAt,DESC",
                "s", String.format("{\"message\": \"%s\"}", commentMsg)
        );

        CreatedComment createdComment = commentsApiSteps.createComment(
                        account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg)
                .then()
                .statusCode(HTTP_CREATED)
                .extract().as(CreatedComment.class);

        commentsApiSteps.deleteComment(
                account1Id, account1PublicKey, account1Signature, createdComment.getId(), reason)
                .then()
                .statusCode(HTTP_OK);

        CommentResponse commentResponse = commentsApiSteps.getComments(queryToGetCreatedComment).then()
                .statusCode(HTTP_OK)
                .extract().as(CommentResponse.class);

        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getTotal().intValue(), 0, "total");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPageCount().intValue(), 1, "pageCount");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getPage().intValue(), 1, "page");
        commentsApiSteps.assertDtoValue(commentResponse, r -> r.getCount().intValue(), 0, "count");
        commentsApiSteps.assertCollectionHasCorrectSize(commentResponse.getData(), 0);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete non-existing comment for a proposal")
    @DisplayName("User should not be able to delete non-existing comment for a proposal")
    void deleteNonExistingCommentForProposal() {
        String reason = "Language";
        BigDecimal invalidId = BigDecimal.valueOf(31313);
        String errorMsg = String.format("Comment with commentId %s not found", invalidId);

        commentsApiSteps.deleteComment(
                        account1Id, account1PublicKey, account1Signature, invalidId, reason)
                .then()
                .statusCode(HTTP_NOT_FOUND)
                .extract().body().path("message", errorMsg);
    }

    @Test
    @Severity(SeverityLevel.CRITICAL)
    @Story("User should not be able to delete existing comment for a proposal (by using invalid public key)")
    @DisplayName("User should not be able to delete existing comment for a proposal (by using invalid public key)")
    void deleteExistingCommentForProposalWithInvalidPublicKey() {
        String contextType = "Proposal";
        String reason = "Language";
        String errorMsg = String.format("Account %s identity is invalid - public key", account1Id);
        String commentMsg = WaitUtils.getEpochMillis() + faker.lorem().characters(15, 20);

        CreatedComment createdComment = commentsApiSteps.createComment(
                        account1Id, account1PublicKey, account1Signature, testProposal, contextType, commentMsg)
                .then()
                .statusCode(HTTP_CREATED)
                .extract().as(CreatedComment.class);

        commentsApiSteps.deleteComment(
                        account1Id, account2PublicKey, account1Signature, createdComment.getId(), reason)
                .then()
                .statusCode(HTTP_FORBIDDEN)
                .extract().body().path("message", errorMsg);
    }
}
