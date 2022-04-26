package api.app.astrodao.com.tests.dao;

import api.app.astrodao.com.core.dto.api.dao.AccountDAOs;
import api.app.astrodao.com.openapi.models.Dao;
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

import java.util.Arrays;
import java.util.List;

import static java.net.HttpURLConnection.*;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("daoAccountDaosAccountIdApiTests")})
@Epic("DAO")
@Feature("/daos/account-daos/{accountId} API tests")
@DisplayName("/daos/account-daos/{accountId} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaoAccountDaosAccountIdApiTests extends BaseTest {
	private final DaoApiSteps daoApiSteps;

	@Value("${accounts.account2.accountId}")
	private String testAccountId;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get list of account DAOs by query param : [accountId]")
	@DisplayName("Get list of account DAOs by query param : [accountId]")
	void getListOfAccountDaosByQueryParamAccountId() {
		AccountDAOs accountDaos = daoApiSteps.getAccountDaos(testAccountId).then()
				.statusCode(HTTP_OK)
				.extract().as( AccountDAOs.class);

		List<String> expectedDaoIds = Arrays.asList(
				"test-dao-1640251360527.sputnikv2.testnet",
				"test-dao-1640251195272.sputnikv2.testnet",
				"test-dao-1640172170380.sputnikv2.testnet",
				"test-dao-1640172018273.sputnikv2.testnet",
				"test-dao-1640171866823.sputnikv2.testnet",
				"autotest-dao-1.sputnikv2.testnet",
				"test-dao-1640080131167.sputnikv2.testnet",
				"test-dao-1640080006438.sputnikv2.testnet");

		daoApiSteps.assertCollectionHasCorrectSize(accountDaos, 8);
		daoApiSteps.assertCollectionHasSameElementsAs(accountDaos, Dao::getId, expectedDaoIds, "id");
		daoApiSteps.assertCollectionContainsExactlyInAnyOrder(accountDaos, Dao::getStatus, "Inactive");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 404 for account-daos with invalid DAO accountId")
	@DisplayName("Get HTTP 404 for account-daos with invalid DAO accountId")
	@CsvSource({"invalidAccountId", "2212332141", "-1", "0",
			"*", "null", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near"})
	void getHttp404ForAccountDaosWithInvalidDaoId(String accountIdParam) {
		String errorMessage = String.format("Account does not exist: %s", accountIdParam);

		daoApiSteps.getAccountDaos(accountIdParam).then()
				.statusCode(HTTP_NOT_FOUND)
				.body("statusCode", equalTo(HTTP_NOT_FOUND),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Not Found"));
	}

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Get HTTP 400 for Account-daos")
	@DisplayName("Get HTTP 400 for Account-daos")
	void getHttp400ForAccountDaos() {
		daoApiSteps.getAccountDaos("").then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Invalid Dao ID"),
				      "error", equalTo("Bad Request"));
	}
}
