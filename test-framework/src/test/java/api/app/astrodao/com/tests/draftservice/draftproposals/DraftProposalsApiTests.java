package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.openapi.models.DraftPageResponse;
import api.app.astrodao.com.openapi.models.DraftProposalBasicResponse;
import api.app.astrodao.com.steps.draftservice.DraftProposalsApiSteps;
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

@Tags({@Tag("all"), @Tag("draftProposalsApiTests")})
@Epic("DAO")
@Feature("/daos/account-daos/{accountId} API tests")
@DisplayName("/daos/account-daos/{accountId} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of draft-proposals with query param: [limit, offset, orderBy, order]")
	@DisplayName("Get list of draft-proposals with query param: [limit, offset, orderBy, order]")
	void getListOfDraftProposalsWithQueryParamsLimitOffsetOrderByOrder() {
		int limit = 11;
		int offset = 10;
		Map<String, Object> query = Map.of(
				"limit", limit,
				"offset", offset,
				"orderBy","createdAt",
				"order", "DESC"
		);

		DraftPageResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposals(query).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftPageResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse1 -> draftPageResponse1.getLimit().intValue(), limit, "limit");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftPageResponse -> draftPageResponse.getOffset().intValue(), offset, "offset");
		draftProposalsApiSteps.assertDtoValueGreaterThan(draftProposalResponse, draftPageResponse -> draftPageResponse.getTotal().intValue(), 142, "total");

		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getId().isEmpty(), "id");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getDaoId().isEmpty(), "daoId");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getProposer().isEmpty(), "proposer");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getTitle().isEmpty(), "title");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getType().getValue().isEmpty(), "type");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getState().getValue().isEmpty(), "state");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getReplies().intValue() >= 0, "replies");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getViews().intValue() >= 0, "views");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> draftProposal.getSaves().intValue() >= 0, "saves");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getUpdatedAt().toString().isEmpty(), "updatedAt");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getData(), draftProposal -> !draftProposal.getCreatedAt().toString().isEmpty(), "createdAt");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsRead(), "No boolean value for field:", "isRead");
		draftProposalsApiSteps.assertCollectionElementsHasBooleanValueAndSize(draftProposalResponse.getData(), draftProposalBasicResponse -> !draftProposalBasicResponse.getIsSaved(), "No boolean value for field:", "isSaved");


		List<OffsetDateTime> createdAtList = draftProposalResponse.getData().stream().map(DraftProposalBasicResponse::getCreatedAt).collect(Collectors.toList());
		draftProposalsApiSteps.assertOffsetDateTimesAreSortedCorrectly(createdAtList, Comparator.reverseOrder(),
		                                                              "Draft proposals should be sorted by 'createdAt' field in DESC order");
	}
}