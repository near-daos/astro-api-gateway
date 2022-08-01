package api.app.astrodao.com.tests.apiservice.dao;

import api.app.astrodao.com.core.dto.api.dao.members.DaoMemberVotes;
import api.app.astrodao.com.openapi.models.DaoMemberVote;
import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static api.app.astrodao.com.core.Constants.Variables.EMPTY_STRING;
import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("daosIdMembersApiTests")})
@Epic("DAO")
@Feature("/daos/{id}/members API tests")
@DisplayName("/daos/{id}/members API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaosIdMembersApiTests extends BaseTest {
	private final DaoApiSteps daoApiSteps;

	@Value("${test.dao1}")
	private String testDao;

	@Value("${accounts.account1.accountId}")
	private String accountId;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get a list of members for valid DAO")
	@DisplayName("User should be able to get a list of members for valid DAO")
	void getListOfMembersForValidDao() {
		DaoMemberVotes daoMemberVote = daoApiSteps.getDaoMembers("anank.sputnikv2.testnet").then()
				.statusCode(HTTP_OK)
				.extract().as(DaoMemberVotes.class);

		daoApiSteps.assertCollectionElementsHasValue(daoMemberVote, daoMember -> !daoMember.getAccountId().isEmpty(), "accountId");
		daoApiSteps.assertCollectionElementsHasValue(daoMemberVote, daoMember -> daoMember.getVoteCount().intValue() >= 0, "voteCount");
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("User should be able to get a list with single member for valid DAO")
	@DisplayName("User should be able to get a list with single member for valid DAO")
	void getListWithSingleMember() {
		DaoMemberVotes daoMemberVote = daoApiSteps.getDaoMembers(testDao).then()
				.statusCode(HTTP_OK)
				.extract().as(DaoMemberVotes.class);

		daoApiSteps.assertCollectionContainsOnly(daoMemberVote, DaoMemberVote::getAccountId, accountId, "accountId");
		daoApiSteps.assertCollectionElementsHasValue(daoMemberVote, daoMember -> daoMember.getVoteCount().intValue() >= 710, "voteCount");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for DAO members with invalid 'daoId' param")
	@DisplayName("Get HTTP 400 for DAO members with invalid 'daoId' param")
	@CsvSource({"invalidAccountId", "2212332141", "-1", "0", "testdao3132498.testnet",
			"*", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near", "null"})
	void getHttp400ForDaoMembersWithInvalidDaoIdParam(String daoId) {
		String errorMessage = "Invalid DAO ID " + daoId;

		daoApiSteps.getDaoMembers(daoId).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for DAO members with empty 'daoId' param")
	@DisplayName("Get HTTP 400 for DAO members with empty 'daoId' param")
	void getHttp400ForDaoMembersWithEmptyDaoIdParam() {
		daoApiSteps.getDaoMembers(EMPTY_STRING).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Invalid DAO ID members"),
				      "error", equalTo("Bad Request"));
	}
}