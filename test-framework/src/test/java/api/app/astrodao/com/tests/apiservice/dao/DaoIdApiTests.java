package api.app.astrodao.com.tests.apiservice.dao;

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

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.hamcrest.Matchers.equalTo;

@Tags({@Tag("all"), @Tag("daosIdApiTests")})
@Epic("DAO")
@Feature("/dao/{id} API tests")
@DisplayName("dao/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaoIdApiTests extends BaseTest {
	private final DaoApiSteps daoApiSteps;

	@Value("${test.dao1}")
	private String testDao;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting a DAO by it's ID")
	@DisplayName("Getting a DAO by it's ID")
	void getDaoById() {
		Dao dao = daoApiSteps.getDAOByID(testDao).then()
				.statusCode(HTTP_OK)
				.extract().as(Dao.class);

		daoApiSteps.assertDtoValue(dao, Dao::getId, testDao, "id");
		daoApiSteps.assertDtoValueGreaterThan(dao, p -> p.getTotalDaoFunds().intValue(), 10, "totalDaoFunds");
	}

	@ParameterizedTest
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for invalid DAO name")
	@DisplayName("Get HTTP 400 for invalid DAO name")
	@CsvSource({"invalidDaoId", "2212332141", "-1", "0", "testdao3132498.testnet",
			"*", "autotest-dao-1.sputnikv2.testnet-1", "another-magic.near", "null"})
	void getHttp400ForInvalidDaoName(String daoId) {
		String errorMessage = "Invalid DAO ID " + daoId;

		daoApiSteps.getDAOByID(daoId).then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo(errorMessage),
				      "error", equalTo("Bad Request"));
	}
}
