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
	private String authToken;


	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("CRUD operation for draft proposals endpoints")
	@DisplayName("CRUD operation for draft proposals endpoints")
	@Description("Following 'Draft Proposals' endpoints were triggered: " +
			"GET|POST /draft-proposals; " +
			"POST|PATCH /draft-proposals/{daoId}/{id}; " +
			"DELETE /draft-proposals/{daoId}/{id}")
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


		String createdDraftId = draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_CREATED)
				.extract().body().asString();

		DraftProposalResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(createdDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getTitle, title1, "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getType, ProposalType.VOTE, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getReplies, BigDecimal.ZERO, "replies");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getViews, BigDecimal.ZERO, "views");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getSaves, BigDecimal.ZERO, "saves");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getUpdatedAt, "updatedAt");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getCreatedAt, "createdAt");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsRead, Boolean.FALSE, "isRead");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsSaved, Boolean.FALSE, "isSaved");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDescription, description1, "description");

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.VOTE, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getProposalVariant(), "ProposePoll", "proposalVariant");

		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getTitle, title1, "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDescription, description1, "description");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getType, ProposalType.VOTE, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.VOTE, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getProposalVariant(), "ProposePoll", "proposalVariant");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getHistory(), draftProposalHistory -> !draftProposalHistory.getUpdatedAt().toString().isEmpty(), "history/updatedAt");


		String title2 = "Test title 2. Created " + getLocalDateTime();
		String description2 = "<p>" + faker.chuckNorris().fact() + "</p>";

		createDraftProposal.setTitle(title2);
		createDraftProposal.setDescription(description2);

		String updatedDraftId = draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, createdDraftId, authToken).then()
				.statusCode(HTTP_OK)
				.extract().body().asString();

		draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(updatedDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getTitle, title2, "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDescription, description2, "description");

		draftProposalsApiSteps.deleteDraftProposal(testDao, createdDraftId, authToken).then()
				.statusCode(HTTP_OK)
				.body("id", equalTo(updatedDraftId),
				      "deleted", equalTo(true));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Create, View, Save, remove Save and Close operations for draft proposal")
	@DisplayName("Create, View, Save, remove Save and Close operations for draft proposal")
	@Description("Following 'Draft Proposals' endpoints were triggered: " +
			"GET|POST /draft-proposals; " +
			"POST /draft-proposals/{daoId}/{id}/view; " +
			"POST /draft-proposals/{daoId}/{id}/save; " +
			"DELETE /draft-proposals/{daoId}/{id}/save; " +
			"POST /draft-proposals/{daoId}/{id}/close")
	void createViewSaveRemoveSaveCloseActionsForDraftProposals() {
		String title = "Test title. Created " + getLocalDateTime();
		String description = "<p>" + faker.yoda().quote() + "</p>";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle(title);
		createDraftProposal.setDescription(description);
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		String createdDraftId = draftProposalsApiSteps.createDraftProposal(createDraftProposal, authToken).then()
				.statusCode(HTTP_CREATED)
				.extract().body().asString();

		DraftProposalResponse draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(createdDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getTitle, title, "title");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getType, ProposalType.VOTE, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getState, DraftProposalState.OPEN, "state");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getReplies, BigDecimal.ZERO, "replies");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getViews, BigDecimal.ZERO, "views");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getSaves, BigDecimal.ZERO, "saves");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getUpdatedAt, "updatedAt");
		draftProposalsApiSteps.assertDtoHasValue(draftProposalResponse, DraftProposalResponse::getCreatedAt, "createdAt");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsRead, Boolean.FALSE, "isRead");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsSaved, Boolean.FALSE, "isSaved");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getDescription, description, "description");

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.VOTE, "type");
		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, draftProposal -> draftProposal.getKind().getProposalVariant(), "ProposePoll", "proposalVariant");

		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getId, createdDraftId, "id");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDaoId, testDao, "daoId");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getProposer, testAccountId, "proposer");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getTitle, title, "title");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getDescription, description, "description");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), DraftProposalHistoryResponse::getType, ProposalType.VOTE, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getType(), ProposalKindSwaggerDto.TypeEnum.VOTE, "type");
		draftProposalsApiSteps.assertCollectionContainsOnly(draftProposalResponse.getHistory(), draftProposalHistoryResponse -> draftProposalHistoryResponse.getKind().getProposalVariant(), "ProposePoll", "proposalVariant");
		draftProposalsApiSteps.assertCollectionElementsHasValue(draftProposalResponse.getHistory(), draftProposalHistory -> !draftProposalHistory.getUpdatedAt().toString().isEmpty(), "history/updatedAt");


		draftProposalsApiSteps.viewDraftProposal(testDao, createdDraftId, authToken).then()
				.statusCode(HTTP_CREATED)
				.body(equalTo("true"));

		draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(createdDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsRead, Boolean.TRUE, "isRead");


		draftProposalsApiSteps.saveDraftProposal(testDao, createdDraftId, authToken).then()
				.statusCode(HTTP_CREATED)
				.body(equalTo("true"));

		draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(createdDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsSaved, Boolean.TRUE, "isSaved");


		draftProposalsApiSteps.unsaveDraftProposal(testDao, createdDraftId, authToken).then()
				.statusCode(HTTP_OK)
				.body(equalTo("true"));

		draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(createdDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getIsSaved, Boolean.FALSE, "isSaved");


		draftProposalsApiSteps.closeDraftProposal(testDao, createdDraftId, authToken).then()
				.statusCode(HTTP_CREATED)
				.body(equalTo("true"));

		draftProposalResponse = draftProposalsApiSteps.getDraftProposalById(createdDraftId, testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as(DraftProposalResponse.class);

		draftProposalsApiSteps.assertDtoValue(draftProposalResponse, DraftProposalResponse::getState, DraftProposalState.CLOSED, "state");
	}
}