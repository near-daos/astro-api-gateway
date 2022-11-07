package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.core.utils.Base64Utils;
import api.app.astrodao.com.openapi.models.CreateDraftProposal;
import api.app.astrodao.com.openapi.models.ProposalKindSwaggerDto;
import api.app.astrodao.com.openapi.models.ProposalType;
import api.app.astrodao.com.steps.draftservice.DraftProposalsApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import com.github.javafaker.Faker;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static api.app.astrodao.com.core.utils.WaitUtils.getLocalDateTime;
import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("draftProposalsDaoIdIdApiTests")})
@Epic("Draft Proposals")
@Feature("/draft-proposals/{daoId}/{id} API tests")
@DisplayName("/draft-proposals/{daoId}/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsDaoIdIdApiTests extends BaseTest {
	private final DraftProposalsApiSteps draftProposalsApiSteps;
	private final Faker faker;


	@Value("${accounts.account1.accountId}")
	private String account1Id;

	@Value("${test.dao1}")
	private String testDao;

	@Value("${accounts.account1.token}")
	private String authToken;

	@Value("${accounts.account1.publicKey}")
	private String account1PublicKey;

	@Value("${accounts.account1.signature}")
	private String account1Signature;


	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for draft proposal PATCH endpoint with non-existing draft id")
	@DisplayName("Get HTTP 404 for draft proposal PATCH endpoint with non-existing draft id")
	void getHttp404ForDraftProposalPatchEndpointWithNonExistingDraftId() {
		String nonExistingDraftId = "00ed00c0000e0e000000f00f";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.yoda().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, nonExistingDraftId, authToken).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo("Draft proposal 00ed00c0000e0e000000f00f does not exist"),
				      "error", equalTo("Not Found"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal PATCH endpoint with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal PATCH endpoint with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForDraftProposalPatchEndpointWithNullAndInvalidAccountIdParam(String accountId) {
		String authToken = Base64Utils.encodeAuthToken(accountId, account1PublicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);
		String draftId = "62fdd6e98c658d00092a012d";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.harryPotter().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal PATCH endpoint with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal PATCH endpoint with empty 'accountId' parameter")
	void getHttp403ForDraftProposalPatchEndpointWithEmptyAccountIdParam() {
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, account1PublicKey, account1Signature);
		String draftId = "62fdd6e98c658d00092a012d";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.harryPotter().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal PATCH endpoint with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal PATCH endpoint with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey", "ed25519:5FwoV3MFB94ExfgycBvUQaTbTfgSMPAcfX62bgLBqEPR"})
	void getHttp403ForDraftProposalPatchEndpointWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(account1Id, publicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", account1Id);
		String draftId = "62fdd6e98c658d00092a012d";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.harryPotter().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal PATCH endpoint with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal PATCH endpoint with empty 'publicKey' parameter")
	void getHttp403ForDraftProposalPatchEndpointWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, EMPTY_STRING, account1Signature);
		String draftId = "62fdd6e98c658d00092a012d";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.harryPotter().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal PATCH endpoint with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal PATCH endpoint with invalid 'signature' parameter")
	void getHttp403ForDraftProposalPatchEndpointWithInvalidSignatureParam() {
		String invalidSignature = account1Signature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, invalidSignature);
		String draftId = "62fdd6e98c658d00092a012d";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.harryPotter().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal PATCH endpoint with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal PATCH endpoint with null 'signature' parameter")
	void getHttp403ForDraftProposalPatchEndpointWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, null);
		String draftId = "62fdd6e98c658d00092a012d";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.harryPotter().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal PATCH endpoint with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal PATCH endpoint with empty 'signature' parameter")
	void getHttp403ForDraftProposalPatchEndpointWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, EMPTY_STRING);
		String draftId = "62fdd6e98c658d00092a012d";

		CreateDraftProposal createDraftProposal = new CreateDraftProposal();
		createDraftProposal.setDaoId(testDao);
		createDraftProposal.setTitle("Test title. Created " + getLocalDateTime());
		createDraftProposal.setDescription("<p>" + faker.harryPotter().quote() + "</p>");
		createDraftProposal.setType(ProposalType.VOTE);

		ProposalKindSwaggerDto kind = new ProposalKindSwaggerDto();
		kind.setType(ProposalKindSwaggerDto.TypeEnum.VOTE);
		kind.setProposalVariant("ProposePoll");

		createDraftProposal.setKind(kind);

		draftProposalsApiSteps.updateDraftProposal(createDraftProposal, testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for draft proposal DELETE endpoint for already closed draft proposal")
	@DisplayName("Get HTTP 400 for draft proposal DELETE endpoint for already closed draft proposal")
	void getHttp400ForDraftProposalDeleteEndpointForAlreadyClosedDraftProposal() {
		String closedDraftId = "6304a2a116e4390008f6b855";
		draftProposalsApiSteps.deleteDraftProposal(testDao, closedDraftId, authToken).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Draft proposal is closed"),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 404 for draft proposal DELETE endpoint for not existing draft proposal")
	@DisplayName("Get HTTP 404 for draft proposal DELETE endpoint for not existing draft proposal")
	void getHttp404ForDraftProposalDeleteEndpointForNotExistingDraftProposal() {
		String nonExistingDraftId = "00ed00c0000e0e000000f00f";
		draftProposalsApiSteps.deleteDraftProposal(testDao, nonExistingDraftId, authToken).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo("Draft proposal 00ed00c0000e0e000000f00f does not exist"),
				      "error", equalTo("Not Found"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal DELETE endpoint with null and invalid 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal DELETE endpoint with null and invalid 'accountId' parameter")
	@NullSource
	@CsvSource({"astro-automation.testnet", "automation-01.testnet", "another-magic.near", "test-dao-1641395769436.sputnikv2.testnet"})
	void getHttp403ForDraftProposalDeleteEndpointWithNullAndInvalidAccountIdParam(String accountId) {
		String draftId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(accountId, account1PublicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", accountId);

		draftProposalsApiSteps.deleteDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal DELETE endpoint with empty 'accountId' parameter")
	@DisplayName("Get HTTP 403 for draft proposal DELETE endpoint with empty 'accountId' parameter")
	void getHttp403ForDraftProposalDeleteEndpointWithEmptyAccountIdParam() {
		String draftId = "63063c43a050fd00089b1f33";
		String authToken = Base64Utils.encodeAuthToken(EMPTY_STRING, account1PublicKey, account1Signature);

		draftProposalsApiSteps.deleteDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal DELETE endpoint with null and invalid 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal DELETE endpoint with null and invalid 'publicKey' parameter")
	@NullSource
	@CsvSource({"invalidPublicKey", "ed25519:5FwoV3MFB94ExfgycBvUQaTbTfgSMPAcfX62bgLBqEPR"})
	void getHttp403ForDraftProposalDeleteEndpointWithNullAndInvalidPublicKeyParam(String publicKey) {
		String authToken = Base64Utils.encodeAuthToken(account1Id, publicKey, account1Signature);
		String errorMessage = String.format("Account %s identity is invalid - public key", account1Id);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.deleteDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal DELETE endpoint with empty 'publicKey' parameter")
	@DisplayName("Get HTTP 403 for draft proposal DELETE endpoint with empty 'publicKey' parameter")
	void getHttp403ForDraftProposalDeleteEndpointWithEmptyPublicKeyParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, EMPTY_STRING, account1Signature);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.deleteDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal DELETE endpoint with invalid 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal DELETE endpoint with invalid 'signature' parameter")
	void getHttp403ForDraftProposalDeleteEndpointWithInvalidSignatureParam() {
		String invalidSignature = account1Signature.substring(10);
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, invalidSignature);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.deleteDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal DELETE endpoint with null 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal DELETE endpoint with null 'signature' parameter")
	void getHttp403ForDraftProposalDeleteEndpointWithNullSignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, null);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.deleteDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Invalid signature"),
				      "error", equalTo("Forbidden"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 403 for draft proposal DELETE endpoint with empty 'signature' parameter")
	@DisplayName("Get HTTP 403 for draft proposal DELETE endpoint with empty 'signature' parameter")
	void getHttp403ForDraftProposalDeleteEndpointWithEmptySignatureParam() {
		String authToken = Base64Utils.encodeAuthToken(account1Id, account1PublicKey, EMPTY_STRING);
		String draftId = "63063c43a050fd00089b1f33";

		draftProposalsApiSteps.deleteDraftProposal(testDao, draftId, authToken).then()
				.statusCode(HTTP_FORBIDDEN)
				.body("statusCode", equalTo(HTTP_FORBIDDEN),
				      "message", equalTo("Authorization header payload is invalid"),
				      "error", equalTo("Forbidden"));
	}

}