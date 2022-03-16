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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Tags({@Tag("all"), @Tag("daosIdApiTests")})
@Epic("DAO")
@Feature("/dao/{id} API tests")
@DisplayName("dao/{id} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DaoIdApiTests extends BaseTest {
	private final DaoApiSteps daoApiSteps;

	@Value("${test.dao}")
	private String testDao;

	@Test
	@Severity(SeverityLevel.CRITICAL)
	@Story("Getting a DAO by it's ID")
	@DisplayName("Getting a DAO by it's ID")
	void getDaoById() {
		ResponseEntity<String> response = daoApiSteps.getDAOByID(testDao);
		daoApiSteps.assertResponseStatusCode(response, HttpStatus.OK);

		Dao dao = daoApiSteps.getResponseDto(response, Dao.class);

		daoApiSteps.assertDtoValue(dao, Dao::getId, testDao, "id");
		daoApiSteps.assertDtoValueGreaterThan(dao, p -> p.getTotalDaoFunds().intValue(), 10, "totalDaoFunds");
	}
}