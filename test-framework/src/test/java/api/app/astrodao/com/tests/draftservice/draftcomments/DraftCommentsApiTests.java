package api.app.astrodao.com.tests.draftservice.draftcomments;

import api.app.astrodao.com.openapi.models.DraftCommentPageResponse;
import api.app.astrodao.com.openapi.models.DraftCommentResponse;
import api.app.astrodao.com.steps.draftservice.DraftCommentsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("draftCommentsApiTests")})
@Epic("Draft Comments")
@Feature("/draft-comments API tests")
@DisplayName("/draft-comments API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftCommentsApiTests extends BaseTest {
	public final DraftCommentsApiSteps draftCommentsApiSteps;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft comments with query param: [limit, offset, order, contextType]")
	@DisplayName("Get list of draft comments with query param: [limit, offset, order, contextType]")
	void getListOfDraftCommentsWithQueryParams() {
		int limit = 5;
		int offset = 5;
		Map<String, Object> query = Map.of(
				"limit", limit,
				"offset", offset,
				"order","DESC",
				"contextType", "DraftProposal"
		);

		DraftCommentPageResponse draftCommentPageResponse = draftCommentsApiSteps.getDraftComments(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftCommentPageResponse.class);

		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getLimit().intValue(), limit, "limit");
		draftCommentsApiSteps.assertDtoValue(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getOffset().intValue(), offset, "offset");
		draftCommentsApiSteps.assertDtoValueGreaterThan(draftCommentPageResponse, draftCommentResponse -> draftCommentResponse.getTotal().intValue(), 319, "total");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getId().isEmpty(), "id");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getContextId().isEmpty(), "contextId");
		draftCommentsApiSteps.assertCollectionContainsOnly(draftCommentPageResponse.getData(), DraftCommentResponse::getContextType, DraftCommentResponse.ContextTypeEnum.DRAFTPROPOSAL, "contextType");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getAuthor().isEmpty(), "author");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getMessage().isEmpty(), "message");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getReplies().isEmpty(), "replies");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getLikeAccounts().isEmpty(), "likeAccounts");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> draftCommentResponse.getDislikeAccounts().isEmpty(), "dislikeAccounts");

		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getCreatedAt().toString().isEmpty(), "createdAt");
		draftCommentsApiSteps.assertCollectionElementsHasValue(draftCommentPageResponse.getData(), draftCommentResponse -> !draftCommentResponse.getUpdatedAt().toString().isEmpty(), "updatedAt");

		List<OffsetDateTime> createdAtList = draftCommentPageResponse.getData().stream().map(DraftCommentResponse::getCreatedAt).collect(Collectors.toList());
		draftCommentsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                               "Draft comments should be sorted by 'createdAt' field in DESC order");
	}


}