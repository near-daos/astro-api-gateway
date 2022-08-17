package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.openapi.models.*;
import api.app.astrodao.com.steps.draftservice.DraftProposalsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import jdk.jfr.Description;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;

import static api.app.astrodao.com.core.utils.WaitUtils.getLocalDateTime;
import static java.net.HttpURLConnection.HTTP_CREATED;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("draftProposalsE2EApiTests")})
@Epic("Draft Proposals")
@Feature("Draft Proposals E2E API tests")
@DisplayName("Draft Proposals E2E API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsE2EApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;
	private final Faker faker;

	@Value("${test.dao1}")
	private String testDao;

	@Value("${accounts.account1.accountId}")
	private String testAccountId;

	@Value("${accounts.account1.token}")
	private String accountToken;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("CRUD operation for draft proposals endpoints")
	@DisplayName("CRUD operation for draft proposals endpoints")
	@Description("Following 'Draft Proposals' endpoints were triggered: " +
			"GET|POST /draft-proposals; " +
			"POST|PATCH /draft-proposals/{id}; " +
			"DELETE /draft-proposals/{id}")
	void crudOperationForDraftProposalsEndpoints() {
		String title1 = "Test title. Created " + getLocalDateTime();
		String description1 = "<p>" + faker.yoda().quote() + "</p>";


		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title1);
		createDraftProposal.setDescription(description1);
		createDraftProposal.setType(ProposalType.VOTE);

			ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
			kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
			kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);


		String createdDraftId = draftProposalsApiSteps.createDraftProposal(createDraftProposal, accountToken).then()
				.statusCode(HTTP_CREATED)
				.extract().body().asString();

		DraftProposalResponse draftProposalResponse1 = draftProposalsApiSteps.getDraftProposalById(createdDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getTitle, title1, "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getType, ProposalType.VOTE, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getReplies, BigDecimal.ZERO, "replies");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getViews, BigDecimal.ZERO, "views");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getSaves, BigDecimal.ZERO, "saves");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse1, DraftProposalResponse::getUpdatedAt, "updatedAt");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse1, DraftProposalResponse::getCreatedAt, "createdAt");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getIsRead, Boolean.FALSE, "isRead");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getIsSaved, Boolean.FALSE, "isSaved");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, DraftProposalResponse::getDescription, description1, "description");

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, draftProposal -> draftProposal.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.VOTE, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse1, draftProposal -> draftProposal.getKind().getProposalVariant(), "ProposePoll", "proposalVariant");

		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), DraftProposalHistoryResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), DraftProposalHistoryResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), DraftProposalHistoryResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), DraftProposalHistoryResponse::getTitle, title1, "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), DraftProposalHistoryResponse::getDescription, description1, "description");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), DraftProposalHistoryResponse::getType, ProposalType.VOTE, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.VOTE, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse1.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getProposalVariant(), "ProposePoll", "proposalVariant");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse1.getHistory(), draftProposalHistory -> !draftProposalHistory.getUpdatedAt().toString().isEmpty(), "history/updatedAt");


		String title2 = "Test title 2. Created " + getLocalDateTime();
		String description2 = "<p>" + faker.chuckNorris().fact() + "</p>";

		createDraftProposal.setTitle(title2);
		createDraftProposal.setDescription(description2);

		String updatedDraftId = draftProposalsApiSteps.updateDraftProposal(createDraftProposal, createdDraftId, accountToken).then()
				.statusCode(HTTP_OK)
				.extract().body().asString();

		DraftProposalResponse draftProposalResponse2 = draftProposalsApiSteps.getDraftProposalById(updatedDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse2, DraftProposalResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse2, DraftProposalResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse2, DraftProposalResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse2, DraftProposalResponse::getTitle, title2, "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse2, DraftProposalResponse::getDescription, description2, "description");

		draftProposalsApiSteps.deleteDraftProposal(createdDraftId, accountToken).then()
				.statusCode(HTTP_OK)
				.body("id", equalTo(updatedDraftId),
				      "deleted", equalTo(true));
	}
}