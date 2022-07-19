package api.app.astrodao.com.tests.dao;

import api.app.astrodao.com.core.dto.api.dao.members.DaoMemberVotes;
import api.app.astrodao.com.steps.DaoApiSteps;
import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.*;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import static java.net.HttpURLConnection.HTTP_OK;

@Tags({@Tag("all"), @Tag("daosIdMembersApiTests")})
@Epic("DAO")
@Feature("/daos/{id}/members API tests")
@DisplayName("/daos/{id}/members API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaosIdMembersApiTests extends BaseTest {
	private final DaoApiSteps daoApiSteps;

	@Value("${test.dao1}")
	private String testDao;


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
}
