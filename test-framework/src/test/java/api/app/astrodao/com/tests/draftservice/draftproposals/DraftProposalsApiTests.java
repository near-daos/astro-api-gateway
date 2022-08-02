package api.app.astrodao.com.tests.draftservice.draftproposals;

import api.app.astrodao.com.tests.BaseTest;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.springframework.beans.factory.annotation.Autowired;

@Tags({@Tag("all"), @Tag("draftProposalsApiTests")})
@Epic("DAO")
@Feature("/daos/account-daos/{accountId} API tests")
@DisplayName("/daos/account-daos/{accountId} API tests")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DraftProposalsApiTests extends BaseTest {

}