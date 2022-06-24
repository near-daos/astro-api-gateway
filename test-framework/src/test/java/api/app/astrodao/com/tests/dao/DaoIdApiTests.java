package api.app.astrodao.com.tests.dao;

import api.app.astrodao.com.openapi.models.Dao;
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

	@Test
	@Severity(SeverityLevel.NORMAL)
	@Story("Get HTTP 400 for invalid DAO name")
	@DisplayName("Get HTTP 400 for invalid DAO name")
	void getHttp400ForInvalidDaoName() {
		daoApiSteps.getDAOByID("InvaliDaoName").then()
				.statusCode(HTTP_BAD_REQUEST)
				.body("statusCode", equalTo(HTTP_BAD_REQUEST),
				      "message", equalTo("Invalid Dao ID"),
				      "error", equalTo("Bad Request"));
	}
}
